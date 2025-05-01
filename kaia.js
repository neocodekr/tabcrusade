var sdk = null;
var connectedAddress = null;
var myGameInstance = null;

var Module = {
  onRuntimeInitialized: function() {
    console.log("Runtime initialized");
  },
  env: {
    MintToken: function(amount) {
      window.MintToken(amount);
    },
    GetBalance: function() {
      window.GetBalance();
    },
    ConnectWallet: function() {
      window.ConnectWallet();
    },
    DisconnectWallet: function() {
      window.DisconnectWallet();
    },
    GetConnectedAddress: function() {
      var address = window.GetConnectedAddress();
      var bufferSize = lengthBytesUTF8(address) + 1;
      var buffer = _malloc(bufferSize);
      stringToUTF8(address, buffer, bufferSize);
      return buffer;
    }
  }
};

async function initializeSDK( cId ) {
  try {
    sdk = await DappPortalSDK.init({
      clientId: cId,
      chainId: '1001'
    });
    console.log("SDK initialized");
    return true;
  } catch (error) {
    console.error("SDK init error:", error);
    alert("SDK Initialization Failed");
    return false;
  }
}

window.ConnectWallet = async function(cid, lid ) {
  try {
    alert('cid = ' + cid + ',' + 'lif = ' + lid);
    if ( liff ) {
      liff.init({ liffId: lid,})
        .then(() => {
          if (!liff.isLoggedIn()) {
            liff.login();

          } else {
            const idToken = liff.getIDToken();
            console.log('getIDToken = ' + idToken);
            const accessToken = liff.getAccessToken();
            console.log('accessToken = ' + accessToken);
            console.log('liff lan = ' + liff.getAppLanguage());
            console.log('liff profile' + liff.getProfile());
          }
         
        })
        .catch((err) => {
          // Error happens during initialization
          console.log(err.code, err.message);
        });
    }
  
    if (!sdk) {
      const initialized = await initializeSDK(cid);
      if (!initialized) 
      {
        console.log('dapp failed initialize');
        return null;
      }
    }
    console.log("connect wallet");
    const provider = sdk.getWalletProvider();
    console.log("connect wallet2");
    const accounts = await provider.request({ method: 'kaia_requestAccounts' });
    console.log("connect wallet3");
    if (accounts && accounts.length > 0) {
      connectedAddress = accounts[0];
      console.log('address = ' + connectedAddress );
      if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnWalletConnected', connectedAddress);
    }
  } catch (error) {
    if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnWalletError', error.message);
  }
}

window.DisconnectWallet = async function() {
  try {
    if (!sdk) {
      console.error("SDK not initialized");
      return;
    }
    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
    const provider = sdk.getWalletProvider();
    await provider.disconnect();

    connectedAddress = null;
    if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnWalletDisconnected');
    console.log("Wallet disconnected successfully");
  } catch (error) {
    console.error("Disconnect error:", error);
    if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnWalletError', "Disconnect failed: " + error.message);
  }
}

window.GetConnectedAddress = function() {
  return connectedAddress || '';
}

window.MintToken = async function(amount) {
  try {
    const provider = sdk.getWalletProvider();

    const mintSignature = '0xa0712d68';
    const amountHex = amount.toString(16).padStart(64, '0');
    const data = mintSignature + amountHex;

    const tx = {
      from: connectedAddress,
      to: '0x099D7feC4f799d1749adA8815eB21375E13E0Ddb',
      value: '0x0',
      data: data,
      gas: '0x4C4B40'
    };

    const txHash = await provider.request({
      method: 'kaia_sendTransaction',
      params: [tx]
    });

    if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnMintSuccess', txHash);
    GetBalance();
  } catch (error) {
    if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnMintError', error.message);
  }
}

window.GetBalance = async function() {
  try {
    const provider = sdk.getWalletProvider();

    const balanceSignature = '0x70a08231';
    const addressParam = connectedAddress.substring(2).padStart(64, '0');
    const data = balanceSignature + addressParam;

    const result = await provider.request({
      method: 'kaia_call',
      params: [{
        from: connectedAddress,
        to: '0x099D7feC4f799d1749adA8815eB21375E13E0Ddb',
        data: data
      }, 'latest']
    });

    const balance = parseInt(result, 16);
    if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnBalanceReceived', balance.toString());
  } catch (error) {
    if (myGameInstance) myGameInstance.SendMessage('Web3Manager', 'OnBalanceError', error.message);
  }
}