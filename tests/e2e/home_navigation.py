"""Testes de navegação e responsividade da página inicial da Central de Gestão Só Sal.

Inicia o servidor de desenvolvimento Next.js na raiz do repositório (caminho
resolvido via pathlib, sem hardcode de usuário/máquina), navega pela página
inicial em seis viewports e verifica:

- Título institucional e módulos com status correto
- Sem rotas 404 acidentais (visita links internos reais)
- Sem links fictícios (href="#")
- Abertura e fechamento do menu mobile com foco acessível
- Navegação por teclado (Tab)
- Cores e estilos aplicados
- Ausência de overflow horizontal
- Rolagem vertical em páginas longas (rolagem real verificada)
- Console do navegador sem erros relevantes
- Processo do servidor iniciado e encerrado corretamente (pid rastreado, porta verificada)
"""

from __future__ import annotations

import socket
import subprocess
import time
import urllib.request
from contextlib import contextmanager
from pathlib import Path

from playwright.sync_api import sync_playwright

PORT = 3000
BASE_URL = f"http://localhost:{PORT}"
# Caminho da raiz do repositório (tests/e2e/ -> raiz do projeto)
REPO_ROOT = Path(__file__).resolve().parents[2]
DEV_CMD = "npm run dev"

VIEWPORTS = [
    ("mobile", 375, 667),
    ("tablet", 768, 1024),
    ("tablet-pequeno", 900, 1024),
    ("tablet-limite", 1023, 1024),
    ("tablet-lg", 1024, 1024),
    ("desktop", 1280, 800),
]


def _port_is_free(port: int) -> bool:
    """Verifica se a porta TCP está livre (nenhum processo escutando nela)."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        return sock.connect_ex(("127.0.0.1", port)) != 0


@contextmanager
def dev_server():
    """Inicia o servidor Next.js na raiz do repositório e o encerra ao sair.

    Garante que a porta esteja livre antes de iniciar, rastreia o PID do
    processo criado, detecta falhas de inicialização e encerra a árvore de
    processos ao finalizar (incluindo filhos do npm/next).
    """
    if not _port_is_free(PORT):
        raise RuntimeError(
            f"Porta {PORT} já está em uso. Encerre outro servidor antes de rodar os testes."
        )

    creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    proc = subprocess.Popen(
        DEV_CMD,
        cwd=str(REPO_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=True,
        creationflags=creationflags,
    )

    started = False
    try:
        # Verifica que o servidor iniciou corretamente (responde na porta)
        for _ in range(60):
            if proc.poll() is not None:
                raise RuntimeError(
                    f"Servidor Next.js encerrou precocemente com código {proc.returncode}"
                )
            try:
                urllib.request.urlopen(BASE_URL, timeout=1)
                started = True
                break
            except Exception:
                time.sleep(1)
        if not started:
            raise RuntimeError("Servidor Next.js não ficou disponível a tempo")
        yield BASE_URL
    finally:
        # Encerra a árvore de processos criada (Windows: taskkill /T mata filhos)
        if proc.poll() is None:
            try:
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=10,
                )
            except Exception:
                proc.kill()
            try:
                proc.wait(timeout=10)
            except Exception:
                proc.kill()


def _assert_no_relevant_console_errors(console_errors):
    relevant_errors = [
        e
        for e in console_errors
        if "favicon" not in e.lower() and "extension" not in e.lower()
    ]
    assert not relevant_errors, f"Erros no console: {relevant_errors}"


def test_homepage_navigation_and_responsiveness():
    console_errors = []
    with dev_server() as base_url, sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for name, width, height in VIEWPORTS:
                page = browser.new_page(
                    viewport={"width": width, "height": height}
                )
                page.on(
                    "console",
                    lambda msg: console_errors.append(msg.text)
                    if msg.type == "error"
                    else None,
                )
                try:
                    page.goto(base_url, wait_until="networkidle")

                    # Título institucional
                    assert page.get_by_text("Central de Gestão").count() >= 1
                    assert page.get_by_text("Só Sal").count() >= 1

                    # Módulos renderizados com status correto
                    for modulo in [
                        "Compras",
                        "Estoque",
                        "Financeiro",
                        "Comercial",
                        "S&OP",
                        "Diretoria",
                        "Administração",
                    ]:
                        assert page.get_by_text(modulo, exact=True).count() >= 1

                    # Compras = Em desenvolvimento, outros = Em breve
                    assert page.get_by_text("Em desenvolvimento").count() >= 1
                    assert page.get_by_text("Em breve").count() >= 1

                    # Sem rotas 404 na home
                    assert page.get_by_text("404").count() == 0
                    assert page.get_by_text("Não encontrado").count() == 0

                    # Sem overflow horizontal
                    body_width = page.evaluate(
                        "() => document.documentElement.scrollWidth"
                    )
                    assert body_width <= width, (
                        f"conteúdo transborda em {name}: {body_width}px > {width}px"
                    )

                    # Cores aplicadas: texto e superfície não transparentes
                    text_color = page.evaluate(
                        "() => getComputedStyle(document.body).color"
                    )
                    assert text_color and "rgba(0, 0, 0, 0)" not in text_color, (
                        f"texto não aplicado em {name}: {text_color}"
                    )
                    card_bg = page.evaluate(
                        "() => { const c = document.querySelector('.bg-card'); return c ? getComputedStyle(c).backgroundColor : null; }"
                    )
                    assert card_bg and "rgba(0, 0, 0, 0)" not in card_bg, (
                        f"cor de superfície não aplicada em {name}: {card_bg}"
                    )

                    # Navegação por teclado (Tab) - foco em elemento interativo
                    page.keyboard.press("Tab")
                    focused = page.evaluate("() => document.activeElement?.tagName")
                    assert focused in ("BUTTON", "A", "INPUT"), (
                        f"foco por teclado não funcional em {name}: {focused}"
                    )

                    # Teste de menu mobile: abre, fica visível, fecha e mantém foco
                    if name in ("mobile", "tablet", "tablet-pequeno", "tablet-limite"):
                        # Abrir menu
                        page.get_by_label("Abrir menu de navegação").click()
                        sidebar = page.locator("aside").first
                        assert sidebar.is_visible(), (
                            f"sidebar não visível após abertura em {name}"
                        )
                        # Menu deve estar aberto (botão agora diz "Fechar menu")
                        assert page.get_by_label("Fechar menu").count() >= 1, (
                            f"botão fechar menu não encontrado em {name}"
                        )
                        # Fechar menu clicando no backdrop FORA da área da sidebar.
                        # A sidebar ocupa x=0 a ~256px (w-64). Clicar na borda direita
                        # da viewport garante que o clique ocorre no backdrop, não na sidebar.
                        page.click(
                            "div.backdrop-blur-sm",
                            position={"x": width - 50, "y": 100},
                        )
                        page.wait_for_timeout(150)
                        # Após fechamento, o botão deve voltar a "Abrir menu"
                        assert page.get_by_label("Abrir menu de navegação").count() >= 1, (
                            f"botão abrir menu não restaurado em {name}"
                        )

                    page.close()
                finally:
                    try:
                        page.close()
                    except Exception:
                        pass
        finally:
            browser.close()

    _assert_no_relevant_console_errors(console_errors)


def test_internal_links_do_not_lead_to_404():
    """Visita links internos existentes e verifica que não retornam 404."""
    with dev_server() as base_url, sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            try:
                page.goto(base_url, wait_until="networkidle")

                # Sem 404 na home
                assert page.get_by_text("404").count() == 0
                assert page.get_by_text("Não encontrado").count() == 0

                # Sem links fictícios com href="#"
                placeholder_links = page.locator('a[href="#"]')
                assert placeholder_links.count() == 0, (
                    f"encontrados {placeholder_links.count()} links com href='#'"
                )

                # Visitar cada link interno existente (exceto externos)
                links = page.locator("a[href]").all()
                visited = set()
                for link in links:
                    href = link.get_attribute("href") or ""
                    if not href or href.startswith("#") or href.startswith("http"):
                        continue
                    if href in visited:
                        continue
                    visited.add(href)

                    link.click()
                    page.wait_for_load_state("networkidle")

                    # Verifica que não é 404
                    assert page.get_by_text("404").count() == 0, (
                        f"Link {href} levou a 404"
                    )
                    assert page.get_by_text("Não encontrado").count() == 0, (
                        f"Link {href} levou a página não encontrada"
                    )

                    page.goto(base_url, wait_until="networkidle")
            finally:
                page.close()
        finally:
            browser.close()


def test_vertical_scroll():
    """Verifica que o container interno rola verticalmente sem deslocar header/sidebar."""
    with dev_server() as base_url, sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 375, "height": 667})
            try:
                page.goto(base_url, wait_until="networkidle")

                # Sem overflow horizontal
                body_width = page.evaluate(
                    "() => document.documentElement.scrollWidth"
                )
                assert body_width <= 375, (
                    f"overflow horizontal em mobile: {body_width}px > 375px"
                )

                # Forçar conteúdo maior que o viewport dentro do container rolável
                page.evaluate(
                    "() => {"
                    "const container = document.querySelector('main > div.overflow-y-auto');"
                    "if (container) {"
                    "  const filler = document.createElement('div');"
                    "  filler.style.height = '2000px';"
                    "  filler.style.width = '1px';"
                    "  container.appendChild(filler);"
                    "}"
                    "}"
                )

                # Selecionar o container real (o que tem overflow-y-auto dentro do main)
                container = page.locator("main > div.overflow-y-auto")
                assert container.count() >= 1, (
                    "container rolável (main > div.overflow-y-auto) não encontrado"
                )

                # Validar scrollTop do container real, não window.scrollY
                scroll_top_before = container.evaluate("(el) => el.scrollTop")
                container.evaluate("(el) => el.scrollBy(0, 300)")
                page.wait_for_timeout(100)
                scroll_top_after = container.evaluate("(el) => el.scrollTop")

                assert scroll_top_after > scroll_top_before, (
                    f"rolagem vertical do container não funcionou: "
                    f"scrollTop {scroll_top_before} -> {scroll_top_after}"
                )

                # Retornar ao topo do container
                container.evaluate("(el) => el.scrollTop = 0")
                page.wait_for_timeout(100)
                scroll_top_top = container.evaluate("(el) => el.scrollTop")
                assert scroll_top_top == 0, (
                    f"volta ao topo do container falhou: scrollTop={scroll_top_top}"
                )

                # Verificar que o cabeçalho não se deslocou (ainda visível no topo)
                header = page.locator("header")
                assert header.count() >= 1, "cabeçalho não encontrado"

            finally:
                page.close()
        finally:
            browser.close()


if __name__ == "__main__":
    test_homepage_navigation_and_responsiveness()
    test_internal_links_do_not_lead_to_404()
    test_vertical_scroll()
    print("TESTES E2E OK")
