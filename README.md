# Bulking Mobile

Aplicativo mobile para acompanhamento da alimentação diária, permitindo registrar refeições, adicionar alimentos e acompanhar informações nutricionais.

## Tecnologias

- React Native
- Expo
- Expo Router
- TypeScript

## Funcionalidades

- Dashboard com resumo nutricional diário
- Visualização das refeições do dia
- Busca e seleção de alimentos
- Adição de alimentos às refeições
- Edição e remoção de alimentos registrados
- Integração com a API do Bulking

## Pré-requisitos

- Node.js
- npm
- Expo Go ou emulador Android/iOS
- Backend do Bulking em execução

## Como executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/SEU_USUARIO/bulking-mobile.git
   ```

2. Acesse a pasta:

   ```bash
   cd bulking-mobile
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Configure a URL da API no arquivo `.env`:

   ```env
   EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8080
   ```

   Substitua `SEU_IP_LOCAL` pelo endereço IP do computador onde o backend está executando.

5. Inicie o aplicativo:

   ```bash
   npx expo start
   ```

## Documentação visual

As imagens do fluxo de adição de alimentos estão disponíveis na pasta `docs/`.

## Projeto relacionado

O aplicativo utiliza o backend Bulking API para consultar e gerenciar os dados nutricionais e as refeições.

---

Desenvolvido como projeto de estudo.
