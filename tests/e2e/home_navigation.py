"""Testes de navegação e responsividade da página inicial da Central de Gestão Só Sal.

Inicia o servidor de desenvolvimento Next.js como subprocesso, navega pela
página inicial em diferentes viewports e verifica elementos essenciais.
"""

from __future__ import annotations

import subprocess
import time
import urllib.request
from contextlib import contextmanager

from playwright.sync_api import sync_playwright

PORT = 3000
BASE_URL = f"http://localhost:{PORT}"
DEV_CMD = ["npm", "run", "dev"]


@contextmanager
def dev_server():
    proc = subprocess.Popen(
        "npm run dev",
        cwd=r"C:\Users\PC\Desktop\central-gestao-sosal-1",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=True,
    )
    try:
        # Espera o servidor ficar disponível
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


VIEWPORTS = [
    ("mobile", 375, 667),
    ("tablet", 768, 1024),
    ("desktop", 1280, 800),
]


def test_homepage_navigation_and_responsiveness():
    with dev_server() as base_url, sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for name, width, height in VIEWPORTS:
                page = browser.new_page(
                    viewport={"width": width, "height": height}
                )
                try:
                    page.goto(base_url, wait_until="networkidle")

                    # Título institucional presente
                    assert page.get_by_text("Central de Gestão").count() >= 1
                    assert page.get_by_text("Só Sal").count() >= 1

                    # Navegação por módulos renderizada
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

                    # Sem barra de rolagem horizontal (responsividade)
                    body_width = page.evaluate(
                        "() => document.documentElement.scrollWidth"
                    )
                    assert body_width <= width, (
                        f"conteúdo transborda em {name}: {body_width}px > {width}px"
                    )

                    page.close()
                finally:
                    try:
                        page.close()
                    except Exception:
                        pass
        finally:
            browser.close()


if __name__ == "__main__":
    test_homepage_navigation_and_responsiveness()
    print("TESTES E2E OK")
