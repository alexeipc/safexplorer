import { IPlugin } from "./IPlugin";
import pluginJson from "./plugins.json";

export class PluginRegistry {
    // Storing registerd plugins
    plugins: IPlugin[] = [];

    register(pluginType: {new (...args: any[]): IPlugin}, ...args: any[]) {
        this.plugins.push(new pluginType(...args));

        // Get all methods
        const methods = Object.getOwnPropertyNames(pluginType.prototype).filter(
            method => method !== 'construtor' && typeof pluginType.prototype[method] === 'function'
        );

        // register these methods
        methods.forEach(method => {
            if (!(this as any)[method]) {
                (this as any)[method] = async (...args: any[]) => {
                    for (let plugin of this.plugins) {
                        if ((typeof (plugin as any)[method]) === 'function') {
                            let result = await (plugin as any)[method](...args);

                            // If the result is truthy then return the result
                            if (result) return result;
                        }
                    }
                    throw new Error(`No plugin found with the given method ${method}`);
                };
            }
        });
    }
}

const pluginRegistry = new PluginRegistry();

/**
 * Plugin section:
 * Register your plugin over here
 */

Object.values(pluginJson).forEach(async (plugin: any) => {
    const {[plugin.class]: PluginClass } = await import(plugin.location);

    pluginRegistry.register(PluginClass);
    console.log(PluginClass);
})

export { pluginRegistry };