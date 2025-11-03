# Constantes para os códigos de região (Bits 4, 3, 2, 1)
INSIDE = 0  # 0000
LEFT = 1    # 0001
RIGHT = 2   # 0010
BOTTOM = 4  # 0100
TOP = 8     # 1000

def _compute_region_code(x, y, x_min, y_min, x_max, y_max):
    """
    Calcula o código de região de 4 bits para um ponto (x,y)
    em relação à janela de recorte. 1828-1838]
    """
    code = INSIDE

    if x < x_min:    # À esquerda (Bit 1)
        code |= LEFT
    elif x > x_max:  # À direita (Bit 2)
        code |= RIGHT
    if y < y_min:    # Abaixo (Bit 3)
        code |= BOTTOM
    elif y > y_max:  # Acima (Bit 4)
        code |= TOP

    return code

def cohen_sutherland_clip(x1, y1, x2, y2, x_min, y_min, x_max, y_max):
    """
    Recorta um segmento de linha (x1, y1)-(x2, y2) contra uma
    janela de recorte retangular (x_min, y_min)-(x_max, y_max).
    """

    # 1. Calcular códigos de região para os pontos finais
    code1 = _compute_region_code(x1, y1, x_min, y_min, x_max, y_max)
    code2 = _compute_region_code(x2, y2, x_min, y_min, x_max, y_max)
    accept = False

    while True:
        # 2. Teste de Aceitação Trivial
        # Se (code1 OU code2) == 0000, ambos os pontos estão dentro.
        if not (code1 | code2):
            accept = True
            break
            
        # 3. Teste de Rejeição Trivial
        # Se (code1 E code2) != 0000, ambos os pontos estão
        # fora na mesma região (ex: ambos à esquerda).
        elif code1 & code2:
            break
            
        # 4. Falhou nos testes, precisa recortar 
        else:
            # Seleciona um ponto que está fora
            code_out = code1 if code1 else code2

            # Calcula a interseção 
            # Usando as equações de reta y = y0 + m(x - x0)
            # e x = x0 + (y - y0) / m
            x, y = 0.0, 0.0
            
            # Inclinação (m)
            delta_y = y2 - y1
            delta_x = x2 - x1

            if code_out & TOP:  # Ponto está acima (Bit 4)
                y = y_max
                # Evita divisão por zero se a linha for vertical
                x = x1 + delta_x * (y_max - y1) / delta_y if delta_y != 0 else x1
            elif code_out & BOTTOM:  # Ponto está abaixo (Bit 3)
                y = y_min
                x = x1 + delta_x * (y_min - y1) / delta_y if delta_y != 0 else x1
            elif code_out & RIGHT:  # Ponto está à direita (Bit 2)
                x = x_max
                # Evita divisão por zero se a linha for horizontal
                y = y1 + delta_y * (x_max - x1) / delta_x if delta_x != 0 else y1
            elif code_out & LEFT:  # Ponto está à esquerda (Bit 1)
                x = x_min
                y = y1 + delta_y * (x_min - x1) / delta_x if delta_x != 0 else y1

            # Atualiza o ponto que estava fora com a nova interseção
            if code_out == code1:
                x1, y1 = x, y
                code1 = _compute_region_code(x1, y1, x_min, y_min, x_max, y_max)
            else:
                x2, y2 = x, y
                code2 = _compute_region_code(x2, y2, x_min, y_min, x_max, y_max)

    if accept:
        print(f"Linha aceita: ({x1:.2f}, {y1:.2f}) até ({x2:.2f}, {y2:.2f})")
    else:
        print("Linha rejeitada.")
        
    return accept, (x1, y1), (x2, y2)

# --- Exemplo de Uso ---
# Definir a Janela de Recorte
X_MIN, Y_MIN = 10, 10
X_MAX, Y_MAX = 50, 50

print("--- Teste 1: Linha totalmente dentro ---")
# P1(20, 20) -> 0000, P2(40, 30) -> 0000
# Teste de Aceitação Trivial
cohen_sutherland_clip(20, 20, 40, 30, X_MIN, Y_MIN, X_MAX, Y_MAX)

print("\n--- Teste 2: Linha totalmente fora (Rejeição Trivial) ---")
# P1(60, 60) -> 1010, P2(70, 70) -> 1010
# Teste de Rejeição Trivial (ambos Acima e à Direita)
cohen_sutherland_clip(60, 60, 70, 70, X_MIN, Y_MIN, X_MAX, Y_MAX)

print("\n--- Teste 3: Linha que precisa ser recortada ---")
# P1(5, 5) -> 0101, P2(40, 60) -> 1000
# Falha nos dois testes triviais, precisa de recorte 
cohen_sutherland_clip(5, 5, 40, 60, X_MIN, Y_MIN, X_MAX, Y_MAX)