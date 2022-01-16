import { ethers } from "./ethers-5.1.esm.min.js";
let signInBtn = document.querySelector('#sign-in-btn');
let provider;
let signer;
let eth_chainids = ['1', '3', '4', '5','42'];

try {
  
  provider = new ethers.providers.Web3Provider(window.ethereum);

  signer = provider.getSigner();
}
catch {

  signInBtn.parentNode.replaceChild(
    document.createTextNode('Non Web3 browser detected. Please install MetaMask.'),
    signInBtn
    
  );
}

var simpleAjax = function(data,type,url) { 

  var promise = new Promise(function(resolve, reject){
      var xhr = new XMLHttpRequest()
      if (type === 'GET') {
        url = url + '/?pb=' + data
        xhr.open(type, url)
        xhr.send();
      }
      else if (type === 'POST') {
        xhr.open(type, url)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(data);
      }
      xhr.onreadystatechange = function() {
          if(xhr.readyState === 4) {
            if((xhr.status >=200 && xhr.status < 300) || xhr.status === 304) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              reject(xhr)
            }
          }
      }
  })
  return promise
}

let mylongin = async () => {

    const current_chainId = window.ethereum.networkVersion
    // console.log(current_chainId)
    if (!eth_chainids.includes(current_chainId)){
      alert("Please Choose the appropriate Ethereum network.") 
      return
    }

    await provider.send("eth_requestAccounts", [])
    let userAddress = await signer.getAddress()
    let GetResp = await simpleAjax(userAddress, 'GET', '/userNonce')
    let userTrackingAddress = GetResp.TrackingAddress
    let userWalletTag = GetResp.WalletTag
    let userEmailAddress = GetResp.EmailAddress
    // console.log(GetResp)

    let rawSignature = await signer.signMessage(GetResp.Nonce);
    // console.log(rawSignature);
    const obj1 = {};
    obj1.pb = userAddress;
    obj1.sig = rawSignature;
    let data = JSON.stringify(obj1)
    // console.log(data)
    let PostResp = await simpleAjax(data, 'POST', '/login')
    // console.log(PostResp)
    if (PostResp.Authenticated === true)  
    {
      sessionStorage.setItem('token',JSON.stringify(PostResp.Token))
      sessionStorage.setItem('userTrackingAddr',JSON.stringify(userTrackingAddress))
      sessionStorage.setItem('userWalletTag',JSON.stringify(userWalletTag))
      sessionStorage.setItem('userEmailAddr',JSON.stringify(userEmailAddress))
      window.location.href='/content' 
    }
}

signInBtn.addEventListener('click', mylongin);


