<div align="center">
  <h1>Venda do Engenho</h1>

  <p>
    Sistema desenvolvido para facilitar o registro, pagamento e acompanhamento das vendas dos produtos do engenho, com foco em rapidez, simplicidade e uso durante o atendimento.
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
    <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
    <img alt="Expo" src="https://img.shields.io/badge/Expo-57.0.21-000020?style=for-the-badge&logo=expo&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  </p>
</div>

## 📱 Sobre o projeto

O **Venda do Engenho** é um aplicativo mobile simples para apoiar o controle de vendas de produtos de um engenho. A proposta é permitir que o vendedor registre rapidamente os itens vendidos, acompanhe o total da venda, finalize o pagamento e consulte o histórico semanal das vendas realizadas.

O projeto foi desenvolvido com **Expo**, **React Native** e **TypeScript**, utilizando persistência local para manter configurações, produtos, dados PIX e registros de vendas no próprio dispositivo.

## ✨ Funcionalidades

- Registro de vendas com múltiplos produtos.
- Seleção de quantidade por produto usando botões de adicionar/remover e campo numérico.
- Limpeza rápida da quantidade de um produto ao manter pressionado o botão de remover.
- Cálculo automático da quantidade total de itens e do valor total da venda.
- Finalização de venda com escolha entre pagamento em **dinheiro** ou **PIX**.
- Cálculo de troco para pagamentos em dinheiro.
- Validação de valor recebido antes de confirmar venda em dinheiro.
- Pagamento PIX com **QR Code gerado localmente** no aplicativo.
- PIX Copia e Cola com botão para copiar o payload.
- Configuração local de chave PIX, nome do recebedor e cidade.
- Histórico de vendas salvo localmente.
- Filtro do histórico por dia da semana.
- Controle semanal das vendas, com resumo da semana atual.
- Resumo por total vendido, quantidade de vendas, dinheiro e PIX.
- Edição dos preços dos produtos nas configurações.
- Alternância entre tema claro e tema escuro.
- Interface adaptada para uso em celular.
- Sistema de venda por voz com reconhecimento de produtos e quantidades antes de adicionar os itens à venda.
- Ícone e splash screen com a identidade visual oficial do aplicativo.
- Perfil de build `preview` para gerar APK Android standalone, sem depender do Metro.

## 🛒 Produtos

Produtos cadastrados no código com preços padrão:

| Produto | Preço padrão |
| --- | ---: |
| Mel | R$ 12,00 |
| Rapadura | R$ 12,00 |
| Rapadura Temperada | R$ 15,00 |
| Batida | R$ 20,00 |
| Caldo de Cana | R$ 5,00 |

Os preços podem ser alterados pela tela de configurações do aplicativo.

## 💳 Pagamento PIX

O aplicativo possui pagamento PIX com QR Code gerado localmente, sem backend, API bancária ou serviço externo.

Na tela de pagamento, ao selecionar **PIX**, o app exibe:

- valor total da venda;
- QR Code PIX;
- orientação para escanear o código;
- botão **COPIAR PIX COPIA E COLA**;
- botão **PAGAMENTO RECEBIDO** para confirmação manual.

As configurações PIX ficam salvas localmente no dispositivo:

- Chave PIX;
- Nome do recebedor;
- Cidade.

O payload PIX é gerado em `src/utils/pix.ts`, seguindo a estrutura BR Code/TLV e cálculo CRC16 local. O QR Code e o Pix Copia e Cola usam o mesmo payload.

## 🎤 Sistema de voz

O projeto possui uma integração de venda por voz usando `expo-speech-recognition`. Na tela de venda, o usuário pode iniciar o reconhecimento, falar produtos e quantidades em português e revisar o que foi entendido em um modal antes de adicionar os itens ao carrinho.

O parser de voz reconhece os produtos cadastrados, alguns aliases e números falados ou digitados. No Android, esse recurso depende de um APK gerado com os módulos nativos do projeto, como a **Development Build** ou o APK **preview** standalone.

## 🎨 Identidade visual

O projeto utiliza a logo oficial em:

- ícone do aplicativo;
- adaptive icon do Android;
- splash screen nativa.

A imagem utilizada fica em:

```text
Front/venda-engenho/assets/images/logo-venda-engenho.png
```

O nome configurado para instalação no Android é **Venda do Engenho**.

## 🖼️ Demonstração

### Tela de vendas

<!-- Adicione aqui uma imagem da tela de vendas -->

### Finalização da venda

<!-- Adicione aqui uma imagem da tela de pagamento -->

### Pagamento PIX

<!-- Adicione aqui uma imagem do QR Code PIX -->

### Histórico

<!-- Adicione aqui uma imagem da tela de histórico -->

### Configurações

<!-- Adicione aqui uma imagem da tela de configurações -->

### Splash screen

<!-- Adicione aqui uma imagem da splash screen com a logo -->

## 🚀 Tecnologias utilizadas

- **React 19**
- **React Native 0.86**
- **Expo 57**
- **Expo Router**
- **TypeScript**
- **AsyncStorage** para persistência local
- **Expo Speech Recognition** para reconhecimento de voz
- **Expo Clipboard** para copiar o Pix Copia e Cola
- **React Native QRCode SVG** para exibir QR Code PIX
- **React Native SVG** como base do QR Code
- **Expo Dev Client** para execução com módulos nativos
- **Expo Splash Screen** para a splash screen nativa
- **EAS Build** para geração de APK Android
- **React Native Reanimated**
- **React Native Gesture Handler**
- **React Native Safe Area Context**
- **React Native Screens**
- **React Native Web**
- **Expo Symbols**

## 📂 Estrutura do projeto

```text
.
├── Front/
│   └── venda-engenho/
│       ├── android/
│       ├── assets/
│       │   ├── expo.icon/
│       │   └── images/
│       │       └── logo-venda-engenho.png
│       ├── scripts/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (tabs)/
│       │   │   │   ├── index.tsx
│       │   │   │   ├── historico.tsx
│       │   │   │   ├── configuracoes.tsx
│       │   │   │   └── _layout.tsx
│       │   │   ├── pagamento.tsx
│       │   │   └── _layout.tsx
│       │   ├── components/
│       │   ├── constants/
│       │   ├── context/
│       │   ├── data/
│       │   ├── hooks/
│       │   ├── types/
│       │   └── utils/
│       │       ├── money.ts
│       │       ├── pix.ts
│       │       └── week.ts
│       ├── app.json
│       ├── eas.json
│       ├── package.json
│       └── tsconfig.json
└── README.md
```

## ⚙️ Como executar o projeto

A partir da raiz do repositório, acesse a pasta do aplicativo:

```bash
cd Front/venda-engenho
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto com Expo:

```bash
npm start
```

Também existem os seguintes scripts no `package.json`:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## 📱 Executando no Android

Existem dois fluxos principais para Android: desenvolvimento e APK standalone.

### Desenvolvimento com Development Build

Use este fluxo enquanto estiver programando, testando alterações e usando Metro.

Dentro da pasta `Front/venda-engenho`, execute:

```bash
npm run android
```

Esse comando usa `expo run:android`, gerando e executando o app Android com suporte a módulos nativos.

Depois da build instalada, inicie o Metro com:

```bash
npx expo start --dev-client
```

### APK standalone para uso normal

Use este fluxo para gerar um APK instalável que abre sozinho no celular, sem computador ligado, sem Metro e sem QR Code do Expo.

```bash
npx eas-cli@latest build --platform android --profile preview
```

O perfil `preview` em `eas.json` está configurado para gerar APK:

```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

Depois de instalar o APK preview, basta tocar no ícone **Venda do Engenho** para usar o aplicativo normalmente.

### Diferença entre builds

| Build | Uso | Precisa de Metro? |
| --- | --- | --- |
| `development` | Programar e testar com Development Build | Sim |
| `preview` | Instalar e usar o app como APK standalone | Não |

## 🔮 Próximas melhorias

Ideias futuras que podem evoluir o projeto:

- Cadastro e remoção de produtos diretamente pelo aplicativo.
- Exportação do histórico de vendas.
- Relatórios por período personalizado.
- Backup ou sincronização dos dados.
- Melhorias nos comandos e feedbacks da venda por voz.

## 👨‍💻 Autor

Desenvolvido por **Everton Gean**

---

Projeto desenvolvido para facilitar e modernizar o controle de vendas do engenho.
