<!DOCTYPE html>
<html lang="en">


<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>


<body>


  <h1>Sistema de Automação Residencial para Monitoramento de Tanque, Consumo de Água e Controle Hidráulico com ESP32</h1>


  <p>Este projeto, desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso técnico em mecatrônica, apresenta um sistema de automação residencial que utiliza um ESP32 para monitorar tanto o nível do tanque de água quanto o consumo diário. Além disso, inclui um sistema hidráulico controlado por um solenoide para permitir o fechamento e abertura do fluxo de água.</p>


  <h2>Recursos e Funcionalidades:</h2>


  <ul>
    <li><strong>Monitoramento de Tanque:</strong> Utilizando um sensor ultrassônico, o sistema calcula a porcentagem de água no tanque, proporcionando uma visão clara do nível atual.</li>
    <li><strong>Medição de Consumo de Água:</strong> Um sensor de fluxo de vazão registra a quantidade de água utilizada, permitindo análises detalhadas do consumo diário.</li>
    <li><strong>Controle Hidráulico:</strong> Um solenoide permite o controle remoto e automático do fluxo de água, proporcionando uma solução eficaz para otimização do uso hídrico.</li>
    <li><strong>Integração com Google Sheets:</strong> Os dados são enviados para um script do Google Sheets, facilitando o armazenamento e análise a longo prazo.</li>
    <li><strong>Configuração Descomplicada:</strong> O WiFiManager simplifica a configuração inicial, garantindo uma integração rápida e fácil na rede doméstica.</li>
  </ul>


  <h2>Como Contribuir:</h2>


  <ol>
    <li><strong>Fork do Repositório:</strong> Faça um fork deste repositório para a sua conta.</li>
    <li><strong>Clone o Repositório:</strong> Clone o repositório forkado para a sua máquina local.
      <pre><code>git clone https://github.com/NatanaelAquino/Sistema-Automacao-Tanque-ESP32
</code></pre>
    </li>
    <li><strong>Faça as Modificações:</strong> Implemente melhorias, corrija bugs ou adicione novos recursos.</li>
    <li><strong>Teste Localmente:</strong> Certifique-se de que tudo está funcionando conforme o esperado.</li>
    <li><strong>Envie um Pull Request:</strong> Abra um pull request descrevendo suas alterações e os motivos por trás delas.</li>
  </ol>seu-username


  <h2>Configuração Inicial:</h2>


  <ol>
    <li>Configure as credenciais do seu WiFi em <code>ssid</code> e <code>password</code>.</li>
    <li>Preencha os detalhes do seu projeto Firebase em <code>FIREBASE_HOST</code> e <code>FIREBASE_AUTH</code>.</li>
  </ol>


  <h3>Observação:</h3>


  <p>Este projeto, além de ser uma solução prática para automação residencial, representa o esforço e conhecimento adquirido ao longo do curso técnico em mecatrônica, consolidado neste Trabalho de Conclusão de Curso. Qualquer contribuição ou sugestão é bem-vinda!</p>


</body>


</html>


