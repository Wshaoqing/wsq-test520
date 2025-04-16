interface Ethereum {
    request: (args: any) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
  }
  
  interface Window {
    ethereum?: Ethereum;
  }