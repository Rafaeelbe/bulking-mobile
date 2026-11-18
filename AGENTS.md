# AGENTS.md — BULKING

## 1. Projeto

Bulking é um aplicativo de registro alimentar e acompanhamento nutricional.
Objetivo: registrar alimentos, refeições, quantidades, calorias e macronutrientes.

## 2. Tecnologias

**Mobile:** React Native, Expo SDK 58, Expo Router, TypeScript.
**Backend:** Java 25, Spring Boot 4.1.2, Maven, PostgreSQL 17 e Docker.

## 3. Arquitetura

### Frontend

- `src/app/`: telas e rotas.
- `src/components/`: componentes reutilizáveis.
- `src/constants/`: constantes.
- `src/hooks/`: hooks.
- `src/services/`: comunicação com API, se existente.

### Backend

Arquitetura em camadas:

- Controller
- Service
- Repository
- Entity
- DTO
- Enum

Respeitar a estrutura existente. Não criar abstrações ou duplicações desnecessárias.

## 4. Navegação

Quatro abas principais:

- Início
- Diário
- Alimentos
- Perfil

Decisões estabelecidas:

- Abas dentro de `src/app/(tabs)/`.
- `add-food` fora das abas, no Stack.
- Botão central `+` utiliza `router.push("/add-food")`.
- Tela `add-food` possui cabeçalho personalizado.
- Voltar utiliza `router.back()`.
- Cabeçalho nativo oculto em `add-food`.
- Preservar `AnimatedSplashOverlay`.

Não alterar a estrutura de navegação sem necessidade.

## 5. Identidade visual

Manter a interface minimalista, clara e consistente.

| Elemento         | Cor       |
| ---------------- | --------- |
| Fundo            | `#F8FAFC` |
| Cards            | `#FFFFFF` |
| Primária         | `#F97316` |
| Texto principal  | `#1E293B` |
| Texto secundário | `#64748B` |
| Proteínas        | `#F97316` |
| Carboidratos     | `#3B82F6` |
| Gorduras         | `#16A34A` |

- Utilizar tipografia Inter, quando configurada.
- Priorizar cards arredondados e espaçamentos consistentes.
- Considerar Safe Area e diferentes tamanhos de tela.
- Preservar telas e componentes visuais já aprovados.

## 6. Funcionalidades existentes

O dashboard possui:

- Saudação e data dinâmicas.
- Resumo de calorias e macronutrientes.
- Cards de refeições.
- Expansão das refeições para visualizar alimentos.

O backend possui o endpoint:

`GET /meals/daily-summary?userId=1&date=YYYY-MM-DD`

O retorno inclui refeições, alimentos e informações nutricionais.

Os cálculos nutricionais são responsabilidade do backend. Não duplicar regras de negócio no frontend.

## 7. API e ambiente

O aplicativo acessa o backend pela rede local.

- Dispositivo físico: utilizar o IP LAN do computador.
- Emulador Android: considerar `10.0.2.2`.
- `localhost` no celular não representa o computador.
- Não assumir que o IP LAN é permanente.
- Preservar a configuração existente da API.
- Centralizar requisições no serviço HTTP existente.
- Tratar erros de rede, HTTP e respostas inválidas.

Não modificar configurações de ambiente sem necessidade.

## 8. Regras de implementação

- Inspecionar arquivos relevantes antes de modificá-los.
- Identificar a causa raiz antes de corrigir problemas.
- Fazer alterações pequenas e localizadas.
- Preservar funcionalidades e contratos existentes.
- Evitar dependências novas sem justificativa.
- Não refatorar arquivos fora do escopo.
- Não inventar endpoints, propriedades ou configurações.
- Não substituir implementações funcionais sem necessidade.

## 9. Economia de comandos e tokens

Não executar comandos de diagnóstico por hábito.

Evitar, sem necessidade concreta:

- `ls -la`, `dir`
- `docker ps`, `docker images`
- `git status`, `git log`, `git diff`
- `npm list`
- `npm install`
- `mvn clean`
- Varreduras completas do projeto.

Preferir:

- Abrir diretamente os arquivos relevantes.
- Pesquisar símbolos e referências específicas.
- Consultar apenas trechos necessários.
- Executar validações direcionadas.
- Reutilizar informações já conhecidas e ainda válidas.

Não repetir verificações, instalar dependências ou reiniciar serviços sem justificativa.

## 10. Fluxo e entrega

Para cada tarefa:

1. Compreender o objetivo.
2. Inspecionar somente o necessário.
3. Identificar impactos.
4. Implementar.
5. Executar validações proporcionais.
6. Apresentar o resultado.

Comunicação direta e econômica. Fazer perguntas somente quando faltar informação essencial.

Ao finalizar, informar:

- Implementação realizada.
- Arquivos modificados.
- Validações executadas.
- Pendências relevantes.

Nunca afirmar que testes foram executados sem realmente executá-los.

**Princípio central:** resolver corretamente cada tarefa com o mínimo de alterações, comandos e consumo de contexto, preservando a arquitetura e a experiência visual do Bulking.
