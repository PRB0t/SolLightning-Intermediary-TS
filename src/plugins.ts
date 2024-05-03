import {exec} from "child_process";
import {BitcoinRpc, BtcRelay, ChainEvents, SwapContract, SwapData} from "crosslightning-base";
import {IPlugin, ISwapPrice} from "crosslightning-intermediary";
import {SolanaSwapData} from "crosslightning-solana";
import {IntermediaryConfig} from "./IntermediaryConfig";

function execPromise(cmd: string): Promise<string> {
    return new Promise<string>(function(resolve, reject) {
        exec(cmd, function(err, stdout) {
            if (err) return reject(err);
            resolve(stdout);
        });
    });
}

export async function getEnabledPlugins<T extends SwapData>(): Promise<{
    name: string,
    plugin: IPlugin<T>
}[]> {
    const plugins: {
        name: string,
        plugin: IPlugin<T>
    }[] = [];
    if(IntermediaryConfig.PLUGINS!=null) {
        for(let name in IntermediaryConfig.PLUGINS) {
            const packageName = IntermediaryConfig.PLUGINS[name];
            console.log("Installing plugin: "+name+" packagename: "+packageName);
            await execPromise("npm i "+packageName);
            const result = await import(name);
            const constructor: new () => IPlugin<T> = result.default;
            plugins.push({
                name,
                plugin: new constructor()
            });
        }
    }
    return plugins;
}
