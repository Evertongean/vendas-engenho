<div align="center">
  <img src="Front/venda-engenho/assets/images/logo-venda-engenho.png" alt="Logo do Venda do Engenho" width="160" />
  <h1>Venda do Engenho</h1>
  <p>Aplicativo mobile para registrar, finalizar e acompanhar as vendas de um engenho com rapidez durante o atendimento.</p>
</div>

## Sobre o projeto

O **Venda do Engenho** simplifica o controle cotidiano de vendas. Em uma única interface, o vendedor seleciona produtos, informa quantidades, acompanha o total e conclui o atendimento em dinheiro ou PIX.

Os registros e as configurações permanecem no próprio dispositivo, permitindo consultar o movimento da semana sem depender de um serviço de backend.

## Principais funcionalidades

- **Registro de vendas:** seleção de produtos, ajuste de quantidades e composição do carrinho.
- **Cálculos automáticos:** quantidade de itens, subtotais e valor total atualizados durante a venda.
- **Pagamentos:** finalização em dinheiro, com validação e troco, ou PIX com QR Code e Copia e Cola.
- **Histórico semanal:** vendas detalhadas, filtros por dia e resumos por forma de pagamento.
- **Configurações:** edição de preços e dados PIX, além de temas claro e escuro.
- **Persistência local:** vendas e preferências armazenadas com AsyncStorage.

## Tecnologias utilizadas

| Tecnologia | Versão no projeto | Uso principal |
| --- | --- | --- |
| React Native | 0.86.3 | Aplicativo mobile |
| Expo | 57.0.21 | Plataforma e ferramentas de desenvolvimento |
| TypeScript | 6.0.3 | Tipagem estática |
| Expo Router | 57.0.20 | Navegação baseada em arquivos |
| AsyncStorage | 2.2.0 | Persistência local |

O projeto também usa um módulo nativo de reconhecimento de fala para adicionar itens por voz, tratado como recurso complementar.

## Estrutura do projeto

```text
.
├── Front/
│   └── venda-engenho/
│       ├── assets/          # Imagens, ícones e identidade do aplicativo
│       ├── scripts/         # Utilitários do projeto Expo
│       ├── src/
│       │   ├── app/         # Rotas e telas do Expo Router
│       │   ├── components/  # Componentes reutilizáveis
│       │   ├── context/     # Estado de vendas e configurações
│       │   ├── data/        # Catálogo padrão de produtos
│       │   ├── hooks/       # Tema e reconhecimento de voz
│       │   ├── types/       # Tipos de domínio
│       │   └── utils/       # Moeda, PIX, voz e semana operacional
│       ├── app.json         # Configuração do Expo
│       ├── eas.json         # Perfis de build do EAS
│       └── package.json     # Dependências e scripts
└── README.md
```

## Como executar

Tenha o Node.js e o npm instalados. A partir da raiz do repositório:

```bash
cd Front/venda-engenho
npm install
npm start
```

Scripts disponíveis:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

O comando `npm run android` executa `expo run:android` e cria uma build nativa local. Para continuar usando essa Development Build com o Metro:

```bash
npx expo start --dev-client
```

> O reconhecimento de voz usa código nativo e não funciona no Expo Go. Use uma Development Build ou outro binário que contenha os módulos configurados no projeto.

## Build Android

O perfil `preview` do EAS está configurado para produzir um APK de distribuição interna:

```bash
cd Front/venda-engenho
npx eas-cli@latest build --platform android --profile preview
```

Esse comando exige uma conta Expo e a configuração adequada do projeto no EAS. A existência do perfil não significa que um APK recente tenha sido gerado ou testado.

## Documentação

A documentação técnica preparada para o projeto abrange instalação, arquitetura, funcionalidades, fluxo de vendas e builds Android. Quando publicada, estará disponível na [Wiki do repositório](https://github.com/Evertongean/vendas-engenho/wiki).

## Autor

Desenvolvido por **Everton Gean**.
