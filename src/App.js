import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import "./App.css";
import backgroundVideo from "./assets/background.mp4";
import nftImage from "./assets/papel_pixel2.png";
import abi from "./contract/contract.json";
import { ethers } from "ethers";
import ReactLoading from "react-loading";

const CONTRACT_ADDRESS = "0x901c45C803223197AEF474290108f497e408E4C4";

function App() {
  const [supply, setSupply] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [transactionHash, setTransactionHash] = useState();

  const {
    authenticate,
    isAuthenticated,
    user,
    isAuthenticating,
    enableWeb3,
    Moralis,
    logout,
  } = useMoralis();

  const startOver = () => {
    logout();
    setInProgress(false);
    setCompleted(false);
    setTransactionHash(null);
  };

  const checkEtherScan = () => {
    let url = "https://rinkeby.etherscan.io/tx/" + transactionHash;
    window.open(url, "_blank");
  };

  const mint = async () => {
    const sendOptions = {
      contractAddress: CONTRACT_ADDRESS,
      functionName: "mint",
      abi: abi,
      params: {
        amount: "2",
      },
      msgValue: "2000000000000000",
    };
    setCompleted(false);
    const transaction = await Moralis.executeFunction(sendOptions);
    setInProgress(true);
    setTransactionHash(transaction.hash);
    await transaction.wait(3).then((receipt) => {
      setInProgress(false);
      setCompleted(true);
    });
    console.log(transaction);
  };

  useEffect(async () => {
    if (isAuthenticated) {
      //connect contract
      const web3Provider = await enableWeb3();
      console.log(web3Provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, web3Provider);
      const totalSupply = await contract.totalSupply(0);
      setSupply(totalSupply.toNumber());
      console.log(totalSupply.toNumber());
    }
  }, [isAuthenticated]);

  return (
    <div className="app">
      <video
        className="background-video"
        loop
        src={backgroundVideo}
        playsInline
        autoPlay
        width="600"
        height="300"
      />

      <div className="main">
        <div className="main-left">
          <img className="nft-image" src={nftImage} alt="" />
        </div>
        <div className="main-right">
          <div className="nft-title">Pixel Dali: Money Heist Mask</div>
          <div className="nft-details">{supply} minted / 200</div>
          {completed && (
            <div className="nft-details">
              Congratulations! Your NFT has been minted.
            </div>
          )}
          <div className="buttons">
            {!isAuthenticated ? (
              <button className="filled" onClick={authenticate}>
                {isAuthenticating ? "Authenticating..." : "Connect Wallet"}
              </button>
            ) : (
              <>
                {inProgress ? (
                  <div className="in-progress">
                    <ReactLoading type={"bubbles"} color="#fff" height="64" />
                    <button onClick={checkEtherScan} className="filled">
                      Check Etherscan
                    </button>
                  </div>
                ) : (
                  <button onClick={mint} className="filled">
                    Mint
                  </button>
                )}
                <button onClick={startOver} className="transparent">
                  Start Over
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
