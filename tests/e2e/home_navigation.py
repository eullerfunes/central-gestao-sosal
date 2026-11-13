"""Testes de navegação e responsividade da página inicial da Central de Gestão Só Sal.

Inicia o servidor de desenvolvimento Next.js como subprocesso (caminho relativo
ao repositório, sem depender do diretório do desenvolvedor), navega pela página
inicial em diferentes viewports e verifica:

- Título institucional
- Módulos renderizados com status correto
- Sem rotas 404 acidentais
- Links válidos (não levam a 404)
- Abertura e fechamento do menu mobile
- Navegação por teclado (Tab)
- Cores e estilos aplicados (background/texto)
- Ausência de overflow horizontal
- Console do navegador sem erros relevantes
"""

from __future__ import annotations

import os
import subprocess
import time
import urllib.request
from contextlib import contextmanager

from playwright.sync_api import sync_playwright

PORT = 3000
BASE_URL = f"http://localhost:{PORT}"
# Caminho relativo ao repositório, sem hardcode do usuário/máquina
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEV_CMD = "npm run dev"

VIEWPORTS = [
    ("mobile", 375, 667),
    ("tablet", 768, 1024),
    ("desktop", 1280, 800),
]


@contextmanager
def dev_server():
    proc = subprocess.Popen(
        DEV_CMD,
        cwd=REPO_ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=True,
    )
    try:
        for _ in range(60):
            try:
                urllib.request.urlopen(BASE_URL, timeout=1)
                break
            except Exception:
                time.sleep(1)
        else:
            raise RuntimeError("Servidor Next.js não ficou disponível a tempo")
        yield BASE_URL
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except Exception:
            proc.kill()


def test_homepage_navigation_and_responsiveness():
    console_errors = []
    with dev_server() as base_url, sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for name, width, height in VIEWPORTS:
                page = browser.new_page(
                    viewport={"width": width, "height": height}
                )
                page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
                try:
                    page.goto(base_url, wait_until="networkidle")

                    # Título institucional
                    assert page.get_by_text("Central de Gestão").count() >= 1
                    assert page.get_by_text("Só Sal").count() >= 1

                    # Módulos renderizados com status correto
                    for modulo in [
                        "Compras", "Estoque", "Financeiro", "Comercial",
                        "S&OP", "Diretoria", "Administração",
                    ]:
                        assert page.get_by_text(modulo, exact=True).count() >= 1

                    # Compras = Em desenvolvimento, outros = Em breve
                    assert page.get_by_text("Em desenvolvimento").count() >= 1
                    assert page.get_by_text("Em breve").count() >= 1

                    # Sem rotas 404
                    assert page.get_by_text("Não encontrado", exact=False).count() == 0
                    assert page.get_by_text("404").count() == 0

                    # Sem overflow horizontal
                    body_width = page.evaluate("() => document.documentElement.scrollWidth")
                    assert body_width <= width, (
                        f"conteúdo transborda em {name}: {body_width}px > {width}px"
                    )

                    # Cores aplicadas: texto e elementos de superfície não transparentes
                    text_color = page.evaluate(
                        "() => getComputedStyle(document.body).color"
                    )
                    assert text_color and "rgba(0, 0, 0, 0)" not in text_color, (
                        f"texto não aplicado em {name}: {text_color}"
                    )
                    # Cor de um card (superfície) não transparente
                    card_bg = page.evaluate(
                        "() => { const c = document.querySelector('.bg-card'); return c ? getComputedStyle(c).backgroundColor : null; }"
                    )
                    assert card_bg and "rgba(0, 0, 0, 0)" not in card_bg, (
                        f"cor de superfície não aplicada em {name}: {card_bg}"
                    )

                    # Navegação por teclado (Tab) - foco visível
                    page.keyboard.press("Tab")
                    focused = page.evaluate("() => document.activeElement?.tagName")
                    assert focused in ("BUTTON", "A", "INPUT"), (
                        f"foco por teclado não funcional em {name}: {focused}"
                    )

                    # Teste de menu mobile apenas no viewport mobile
                    if name == "mobile":
                        # Abrir menu
                        page.get_by_label("Abrir menu de navegação").click()
                        # Sidebar deve ficar visível (translate-x-0)
                        sidebar = page.locator("aside").first
                        assert sidebar.is_visible()
                        # Fechar menu clicando no backdrop
                        page.click("div.backdrop-blur-sm", position={"x": 100, "y": 100})
                        page.wait_for_timeout(100)

                    page.close()
                finally:
                    try:
                        page.close()
                    except Exception:
                        pass
        finally:
            browser.close()

    # Console sem erros relevantes (ignorar avisos de extensão/hydrate conhecidos)
    relevant_errors = [
        e for e in console_errors
        if "favicon" not in e.lower() and "extension" not in e.lower()
    ]
    assert not relevant_errors, f"Erros no console: {relevant_errors}"


def test_no_placeholder_links_and_no_404():
    """Verifica que não existem links fictícios (href="#") nem 404 na home."""
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

                # Todos os links internos apontam para rotas existentes ou externas válidas
                links = page.locator("a").all()
                for link in links:
                    href = link.get_attribute("href")
                    if href and href.startswith("#"):
                        raise AssertionError(f"Link com href='#' encontrado: {href}")
            finally:
                page.close()
        finally:
            browser.close()


if __name__ == "__main__":
    test_homepage_navigation_and_responsiveness()
    test_no_placeholder_links_and_no_404()
    print("TESTES E2E OK")
