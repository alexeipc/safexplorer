import { IPlugin } from "../../src/plugins/IPlugin";
import { PluginRegistry } from "../../src/plugins/pluginRegistry";

jest.setTimeout(30000);

describe("Test get Zip code of a point", () => {
  it("should return a joe", async () => {
    // Create two dummy plugins
    class TestPlugin1 implements IPlugin {
        dataSourceName: string = "Hello";
        pluginName: string = "Test plugin 1";

        exampleFunction1(): string {
            return this.pluginName;
        }
    }
    class TestPlugin2 implements IPlugin {
        dataSourceName: string = "Hi";
        pluginName: string = "Test plugin 2";

        exampleFunction1(): string {
            return this.pluginName;
        }
        async exampleFunction2(): Promise<string> {
            return this.pluginName;
        }
    }

    let pluginRegistry = new PluginRegistry();

    pluginRegistry.register(TestPlugin1);
    pluginRegistry.register(TestPlugin2);

    expect(await (pluginRegistry as any).exampleFunction1()).toBe("Test plugin 1");
    expect(await (pluginRegistry as any).exampleFunction2()).toBe("Test plugin 2");

    // Try to swap the order of plugins
    pluginRegistry = new PluginRegistry();
    pluginRegistry.register(TestPlugin2);
    pluginRegistry.register(TestPlugin1);

    expect(await (pluginRegistry as any).exampleFunction1()).toBe("Test plugin 2");
    expect(await (pluginRegistry as any).exampleFunction2()).toBe("Test plugin 2");
  });
});