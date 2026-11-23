#!/usr/bin/env python3
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "public"

AZUL = (0x1D, 0x4E, 0xD8)
AZUL_FUNDO = (0x0E, 0x2F, 0x8F)
DOURADO = (0xD9, 0x77, 0x06)
BRANCO = (0xFF, 0xFF, 0xFF)

Cor = tuple[int, int, int]

AMOSTRAS = [
    (-1 / 3, -1 / 3), (0.0, -1 / 3), (1 / 3, -1 / 3),
    (-1 / 3, 0.0), (0.0, 0.0), (1 / 3, 0.0),
    (-1 / 3, 1 / 3), (0.0, 1 / 3), (1 / 3, 1 / 3),
]


def distancia_retangulo(
    x: float, y: float, cx: float, cy: float, mx: float, my: float, raio: float
) -> float:
    dx = abs(x - cx) - (mx - raio)
    dy = abs(y - cy) - (my - raio)
    fora = math.hypot(max(dx, 0.0), max(dy, 0.0))
    dentro = min(max(dx, dy), 0.0)
    return fora + dentro - raio


def distancia_losango(x: float, y: float, cx: float, cy: float, mx: float, my: float) -> float:
    norma = abs(x - cx) / mx + abs(y - cy) / my
    return (norma - 1.0) * min(mx, my)


def distancia_circulo(x: float, y: float, cx: float, cy: float, raio: float) -> float:
    return math.hypot(x - cx, y - cy) - raio


def misturar(fundo: Cor, frente: Cor, alfa: float) -> Cor:
    return tuple(round(f * (1 - alfa) + d * alfa) for f, d in zip(fundo, frente))


def cor_do_ponto(x: float, y: float, lado: int) -> tuple[Cor, float]:
    escala = 1024.0
    u, v = x / lado * escala, y / lado * escala

    d_fundo = distancia_retangulo(u, v, 512, 512, 512, 512, 224)
    if d_fundo > 0.75:
        return BRANCO, 0.0

    cor = misturar(AZUL, AZUL_FUNDO, max(0.0, min(1.0, (u + v) / 2048)))

    if distancia_retangulo(u, v, 512, 600, 150, 110, 18) < 0:
        cor = misturar(BRANCO, AZUL_FUNDO, 0.14)

    if distancia_retangulo(u, v, 752, 545, 11, 135, 11) < 0:
        cor = DOURADO

    if distancia_circulo(u, v, 752, 700, 42) < 0:
        cor = DOURADO

    if distancia_losango(u, v, 512, 420, 300, 132) < 0:
        cor = BRANCO

    alfa = 1.0 if d_fundo < -0.75 else max(0.0, min(1.0, 0.5 - d_fundo / 1.5))
    return cor, alfa


def desenhar(lado: int) -> bytes:
    linhas = bytearray()

    for y in range(lado):
        linhas.append(0)
        for x in range(lado):
            soma_r = soma_g = soma_b = soma_a = 0.0
            for dx, dy in AMOSTRAS:
                cor, alfa = cor_do_ponto(x + 0.5 + dx, y + 0.5 + dy, lado)
                soma_r += cor[0] * alfa
                soma_g += cor[1] * alfa
                soma_b += cor[2] * alfa
                soma_a += alfa
            if soma_a <= 0:
                linhas.extend((0, 0, 0, 0))
                continue
            linhas.extend((
                round(soma_r / soma_a),
                round(soma_g / soma_a),
                round(soma_b / soma_a),
                round(soma_a / len(AMOSTRAS) * 255),
            ))

    return bytes(linhas)


def gravar_png(caminho: Path, lado: int, dados: bytes) -> None:
    def bloco(tipo: bytes, conteudo: bytes) -> bytes:
        corpo = tipo + conteudo
        return struct.pack(">I", len(conteudo)) + corpo + struct.pack(">I", zlib.crc32(corpo))

    png = (
        b"\x89PNG\r\n\x1a\n"
        + bloco(b"IHDR", struct.pack(">IIBBBBB", lado, lado, 8, 6, 0, 0, 0))
        + bloco(b"IDAT", zlib.compress(dados, 9))
        + bloco(b"IEND", b"")
    )
    caminho.write_bytes(png)
    print(f"{caminho.relative_to(RAIZ)}: {lado}x{lado}, {len(png) / 1024:.1f} kB")


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nome, lado in (("icone.png", 512), ("favicon.png", 64)):
        gravar_png(DESTINO / nome, lado, desenhar(lado))


if __name__ == "__main__":
    main()
