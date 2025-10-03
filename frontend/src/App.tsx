import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { passetHub } from "./chains";
import { injected } from "wagmi/connectors";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { ABI } from "./BikeRegistryABI";
import { myBikeRegistryAddress } from "./generated";

import './App.css';

interface BikeInfo {
  owner: string;
  brand: string;
  registeredAt: bigint; 
}
type BikeInfoResult = [string, string, bigint]; 

// Dirección del contrato
const contractAddress = myBikeRegistryAddress[passetHub.id];

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect(); 
  const { disconnect } = useDisconnect();

  const [serial, setSerial] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [bikeInfo, setBikeInfo] = useState<BikeInfo | null>(null);

  // Clientes de Viem
  const publicClient = createPublicClient({ chain: passetHub, transport: http() });
  const getWalletClient = async () =>
    createWalletClient({ chain: passetHub, transport: custom((window as any).ethereum) });

  // Registrar Bicicleta 
const registerBike = async () => {
  if (!isConnected || !address) return setStatus("⚠️ Por favor, conecta tu wallet...");
  if (!serial.trim() || !brand.trim()) return setStatus("⚠️ Debes ingresar Serial y Marca.");

  setStatus("Registrando bicicleta en la blockchain...");
  try {
    console.log("Intentando registrar:", { serial, brand, address, contractAddress });
    const walletClient = await getWalletClient();
    const { request } = await publicClient.simulateContract({
      account: address,
      address: contractAddress,
      abi: ABI,
      functionName: "registerBike",
      args: [serial.trim(), brand.trim()],
    });
    const txHash = await walletClient.writeContract(request);
    setStatus(`Transacción enviada. Hash: ${txHash.slice(0, 10)}...${txHash.slice(-4)}`);
  } catch (error: any) {
    console.error("Error en registerBike:", error);
    setStatus(`Error al registrar: ${error.shortMessage || error.message}`);
  }
};

  // Consultar Bicicleta
  const checkBike = async () => {
    if (!serial.trim()) return setStatus("⚠️ Debes ingresar un Serial para buscar.");
    setBikeInfo(null);
    setStatus("⏳ Buscando bicicleta...");
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: "getBikeOwner",
        args: [serial.trim()],
      }) as BikeInfoResult;
      
      const bikeData: BikeInfo = {
        owner: result[0], // address
        brand: result[1], // string
        registeredAt: result[2], // bigint
      };
      
      setStatus("Bicicleta encontrada.");
      setBikeInfo(bikeData);
      
    } catch (error: any) {
      console.error(error);
      // El contrato revierte con "not registered". Manejamos la reversión.
      if (error.shortMessage?.includes('not registered')) {
          setStatus("ℹBicicleta no registrada.");
          setBikeInfo(null);
      } else {
          setStatus(`Error al buscar: ${error.shortMessage || error.message}`);
      }
    }
  };

  return (
    <div className="app-container"> 
      <div className="main-content">
        <div className="layout-grid">
          
          {/* Sidebar de Conexión y Balance (Mantenido) */}
          <div className="sidebar bg-light shadow-md border-right"> 
              <h3 className="title font-bold color-primary">KitDot Registry DApp</h3>
              <p className="subtitle">Polkadot Smart Contracts</p>

              {/* Botón de Conexión / Desconexión */}
            <div className="mt-5 mb-5 flex-row">
                {isConnected ? (
                <button className="button button-disconnect" onClick={() => disconnect()}>
                    Desconectar
                </button>
                ) : (
                <button className="button button-primary" onClick={() => connect({ connector: injected() })}>
                    Conectar Wallet
                </button>
                )}
            </div>

              {/* Mostrar Balance y Address */}
              {isConnected && (
                  <div className="balance-grid border rounded-md p-3">
                      <div className="balance-address">
                          <span className="balance-label">Wallet</span>
                          <span className="balance-value">{address?.slice(0, 8)}...{address?.slice(-4)}</span>
                      </div>
                      <div className="balance-amount">
                          <span className="balance-amount-value">
                              {isConnected ? "..." : "0"} PAS
                          </span>
                      </div>
                  </div>
              )}
          </div>

          {/* Área de Funcionalidad Principal */}
          <div className="main-panel">
              <h2 className="section-title">Registro y Consulta de Bicicletas</h2>

              {/* Formulario de Registro */}
              <div className="form-section">
                  <h3 className="section-subtitle">1. Registrar Nueva Bicicleta</h3>
                  <p className="section-description">El serial se guarda como texto.</p>
                                    <input
                      type="text"
                      className="input-field"
                      placeholder="Serial (ej: ABCD-123)"
                      value={serial}
                      onChange={(e) => setSerial(e.target.value)}
                  />
                  <input
                      type="text"
                      className="input-field"
                      placeholder="Marca (ej: Specialized)"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                  />
                  <button className="button button-secondary" onClick={registerBike} disabled={!isConnected}>
                      Registrar
                  </button>
              </div>

              {/* Formulario de Consulta */}
              <div className="form-section mt-5">
                  <h3 className="section-subtitle">2. Consultar Serial</h3>
                  <div className="flex-row gap-2">
                    <input
                        type="text"
                        className="input-field grow"
                        placeholder="Serial de Bicicleta a Consultar"
                        value={serial}
                        onChange={(e) => setSerial(e.target.value)}
                    />
                    <button className="button button-primary" onClick={checkBike}>
                        Consultar
                    </button>
                  </div>
              </div>
              
              {/* Área de Status */}
              <div className="status-area border rounded-md p-3 my-5">
                  <p className="status-message">{status || "Esperando acción..."}</p>
              </div>

              {/* Mostrar Información de la Bicicleta (Dashboard Widget) */}
              {bikeInfo ? (
                  <div className="bike-detail-widget border-orange rounded-lg bg-light shadow-md">
                      <h4 className="widget-title text-orange font-bold">Detalle de la Bici {serial}</h4>
                      <div className="widget-info-grid">
                          <div><b>Dueño Actual:</b> <span className="break-word">{bikeInfo.owner}</span></div>
                          <div><b>Marca:</b> {bikeInfo.brand}</div>
                          <div><b>Registrada En:</b> 
                              {new Date(Number(bikeInfo.registeredAt) * 1000).toLocaleString()}
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="placeholder-widget border-muted rounded-lg bg-light text-center text-sm text-muted p-4">
                      Busca una bicicleta para ver su estado actual en la blockchain.
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}