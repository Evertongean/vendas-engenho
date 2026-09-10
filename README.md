<div align="center">
  <h1>Venda do Engenho</h1>

  <p>
    Sistema desenvolvido para facilitar o registro e acompanhamento das vendas dos produtos do engenho, com foco em rapidez, simplicidade e uso durante o atendimento.
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

O projeto foi desenvolvido com **Expo**, **React Native** e **TypeScript**, utilizando persistência local para manter configurações e registros de vendas no próprio dispositivo.

## ✨ Funcionalidades

- Registro de vendas com múltiplos produtos.
- Seleção de quantidade por produto usando botões de adicionar/remover e campo numérico.
- Limpeza rápida da quantidade de um produto ao manter pressionado o botão de remover.
- Cálculo automático da quantidade total de itens e do valor total da venda.
- Finalização de venda com escolha entre pagamento em **dinheiro** ou **PIX**.
- Cálculo de troco para pagamentos em dinheiro.
- Validação de valor recebido antes de confirmar venda em dinheiro.
- Histórico de vendas salvo localmente.
- Filtro do histórico por dia da semana.
- Controle semanal das vendas, com resumo da semana atual.
- Resumo por total vendido, quantidade de vendas, dinheiro e PIX.
- Edição dos preços dos produtos nas configurações.
- Alternância entre tema claro e tema escuro.
- Interface adaptada para uso em celular.
- Sistema de venda por voz com reconhecimento de produtos e quantidades antes de adicionar os itens à venda.

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

## 🎤 Sistema de voz

O projeto possui uma integração de venda por voz usando `expo-speech-recognition`. Na tela de venda, o usuário pode iniciar o reconhecimento, falar produtos e quantidades em português e revisar o que foi entendido em um modal antes de adicionar os itens ao carrinho.

O parser de voz reconhece os produtos cadastrados, alguns aliases e números falados ou digitados. No Android, o próprio código informa que esse recurso depende de uma **Development Build** para funcionar corretamente.

## 🖼️ Demonstração

### Tela de vendas

<!-- Adicione aqui uma imagem da tela de vendas -->

### Finalização da venda

<!-- Adicione aqui uma imagem da tela de pagamento -->

### Histórico

<!-- Adicione aqui uma imagem da tela de histórico -->

### Configurações

<!-- Adicione aqui uma imagem da tela de configurações -->

## 🚀 Tecnologias utilizadas

- **React 19**
- **React Native 0.86**
- **Expo 57**
- **Expo Router**
- **TypeScript**
- **AsyncStorage** para persistência local
- **Expo Speech Recognition** para reconhecimento de voz
- **Expo Dev Client** para execução com módulos nativos
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

Para executar no Android, é necessário ter o ambiente Android configurado, com emulador ou dispositivo físico conectado.

Dentro da pasta `Front/venda-engenho`, execute:

```bash
npm run android
```

Esse comando usa `expo run:android`, gerando e executando o app Android com suporte a módulos nativos. Para continuar o desenvolvimento depois da build instalada, inicie o Metro/Expo com:

```bash
npm start
```

O recurso de voz no Android depende de uma **Development Build**, pois utiliza integração nativa de reconhecimento de fala.

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
