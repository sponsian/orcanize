import { createContext } from 'react';
import { ReefSigner } from '@reef-chain/react-lib';
import { network as nw, extension as extReef } from '@reef-chain/util-lib';



interface setAddr {
  (val: string | undefined):void;
}
interface setNet {
  (val: nw.Network):void;
}
interface setExt {
  (val: string):void;
}
interface setAccs {
  (val: any[]):void;
}
export interface ReefState {
  setSelectedAddress: setAddr;
  setSelectedNetwork: setNet;
  setSelectedExtension: setExt
  setAccounts:setAccs;
  
}

interface ReefSignersContext {
  accounts: ReefSigner[]|undefined;
  selectedSigner:ReefSigner|undefined;
  network: nw.Network | undefined;
  reefState: ReefState | undefined;
  extension: extReef.InjectedExtension | undefined;
  selExtName: string|undefined;
}
export default createContext<ReefSignersContext>({
  accounts: [],
  selectedSigner: undefined,
  network: undefined,
  reefState: undefined,
  extension: undefined,
  selExtName: undefined,
});