# Chainlink Solana Data Feeds

Chainlink Solana Data Feeds é um programa para realizar a verificação de preços de ativos na [Chainlink Data Feeds](https://data.chain.link/). Está configurado na rede [Devnet](https://docs.solana.com/clusters#devnet), e é compreendido de um contrato _on-chain_ escrito em [Anchor](https://docs.rs/anchor-lang/latest/anchor_lang/), um _framework Rust_, além de um cliente _off-chain_ escrito em _Javascript_. O contrato requere informações da conta e do _feed_ desejado através do cliente _off-chain_, busca os dados específicos do _feed_ requerido _on-chain_, então escreve o resultado na conta do usuário do contrato, no qual pode ser lido pelo cliente _off-chain_.

## Executando na Devnet

### Requerimentos

- [NodeJS 12](https://nodejs.org/en/download/) ou superior
- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://github.com/solana-labs/solana/releases)
- Um compilador C, como [GCC](https://gcc.gnu.org/install/), por exemplo.

**OBS**: Todos os testes foram realizados em ambiente Linux (Ubuntu 22.04, Xubuntu 20.04). Não há garantias de funcionamento do programa em outros sistemas operacionais.

### Fazendo o Build e Deploy do Contrato

Primeiro, garanta que está no diretório `solana` neste repositório. Caso contrário, acesse-o, pelo comando:

```
cd solana
```
---

Depois, instale as dependências necessárias através do comando:

```
npm install
```
---

Após a instalação das dependências, crie uma nova carteira (se desejado) para realizar os testes, pelo comando:

```
solana-keygen new -o id.json
```

Se quiser utilizar uma chave já armazenada, utilize este comando:

```
touch id.json
cp $(solana-keygen pubkey) id.json
``` 

Se preferir, pode copiar a chave manualmente, consultando `solana-keygen pubkey`, copiando-a e colando no arquivo `id.json`.

Para checar se a chave pública foi armazenada corretamente no arquivo `id.json`, execute o seguinte comando:

```
solana-keygen pubkey id.json
```
---

O próximo passo é adicionar tokens SOL na conta. Como a rede _Devnet_ é limitada em até 2 SOL de adição por pedido de _airdrop_, vamos adicionar 4 SOL como garantia que teremos SOL suficiente para realizar as operações necessárias (ou seja, realizar 2 _airdrops_). Isso será realizado através do comando:

```
solana airdrop 2 $(solana-keygen pubkey ./id.json) --url https://api.devnet.solana.com && solana airdrop 2 $(solana-keygen pubkey ./id.json) --url https://api.devnet.solana.com
```

Se necessário, realize mais _airdrops_ para realizar uma bateria de testes. Para um _build_ e _deploy_, até 4 SOL serão suficientes.

---

Agora, vamos iniciar o programa. Primeiro, fazemos o _build_, através do comando:

```
anchor build
```

O processo de _build_ gera o par de chaves da conta do seu contrato. Antes de fazer o _deploy_ do prgrama, é necessário adicionar a chave pública ao arquivo `lib.rs`. Para fazer isso, será necessário buscar o par de chaves em `./target/deploy/solana-keypair.json` gerado pela _build_ do _Anchor_:

```
solana address -k ./target/deploy/solana-keypair.json
```

Agora é necessário editar o arquivo `lib.rs` e trocar a chave declarada na definição de `declare_id!()` com o valor obtido no passo anterior:

```
declare_id!("<CHAVE_DO_PASSO_ANTERIOR>");
```

Como o código fonte foi atualizado com o novo ID do contrato gerado, você precisa realizar _build_ do contrato novamente, e posteriormente é possível realizar o _deploy_ na _Devnet_:

```
anchor build
anchor deploy --provider.cluster devnet
```

Uma vez que o _deploy_ do contrato ocorreu com sucesso, a saída do terminal vai especificar o ID do programa, de modo que deve ser igual ao valor inserido no arquivo `lib.rs` e no arquivo `Anchor.toml`. Mais uma vez, anote este ID, uma vez que será necessário na chamada de execução do cliente:

```
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: ./id.json
Deploying program "solana"...
Program path: ./target/deploy/solana.so...
Program Id: <ID_DO_PROGRAMA>
```

### Executando o Cliente

O primeiro passo é **setar** as variáveis de ambiente do _Anchor_. Elas são requeridas pelo _framework_ para determinar o provedor a ser usado e qual a carteira vai ser utilizada para interagir com o contrato lançado:

```
export ANCHOR_PROVIDER_URL='https://api.devnet.solana.com'
export ANCHOR_WALLET='./id.json'
```

Agora o cliente JS poderá ser executado. **IMPORTANTE** Não esquecer de passar o ID do contrato obtido nos passos anteriores para ser utilizado no cliente através da _flag_ `--program` apontando para o arquivo JSON contendo a chave da conta que pertence ao programa, assim como o nome do _feed_ desejado, através da flag `--feed` (opcional; caso não seja passado, o cliente utilizará, por padrão, o endereço do _feed SOL/USD_ da _Devnet_). No exemplo, é especificado o nome do _feed ETH/USD_:

```
node client.js --program $(solana address -k ./target/deploy/solana-keypair.json) --feed ETH/USD
```

O cliente, então, vai gerar uma nova conta e passar ao programa lançado, que, por sua vez, vai popular a conta criada com o preço atual do _feed_ especificado. O cliente vai ler o preço armazenado na conta e a saída resultante será impressa no console: 

```
Running client...
priceFeedAccount public key: DNQBqwGijKix2EmKhMMaftZgSywcbfnQZSzfDyEMEfLf
user public key: GWKzUMdSF8Y4xQ3JANTChkaJDFE4UdkvAkHCknmJtJUX
Fetching transaction logs...
[
  'Program BrEqc6zHVR77jrP6U6WZLUV24AZ9UnHrWfDQTDV7VoDY invoke [1]',
  'Program log: Instruction: Execute',
  'Program 11111111111111111111111111111111 invoke [2]',
  'Program 11111111111111111111111111111111 success',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny invoke [2]',
  'Program log: Instruction: Query',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny consumed 2551 of 1360424 compute units',
  'Program return: HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny RZ0GABn5swcAAAAA3ltiYgAVg8dFAAAAAAAAAAAAAAA=',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny success',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny invoke [2]',
  'Program log: Instruction: Query',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny consumed 2245 of 1328033 compute units',
  'Program return: HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny CQAAAEVUSCAvIFVTRA==',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny success',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny invoke [2]',
  'Program log: Instruction: Query',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny consumed 1826 of 1295650 compute units',
  'Program return: HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny CA==',
  'Program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny success',
  'Program log: ETH / USD price is 2997.00000000',
  'Program BrEqc6zHVR77jrP6U6WZLUV24AZ9UnHrWfDQTDV7VoDY consumed 109699 of 1400000 compute units',
  'Program return: BrEqc6zHVR77jrP6U6WZLUV24AZ9UnHrWfDQTDV7VoDY CA==',
  'Program BrEqc6zHVR77jrP6U6WZLUV24AZ9UnHrWfDQTDV7VoDY success'
]
Price of ETH/USD Is: 2997
Success
```