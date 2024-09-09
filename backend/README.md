## Instructions

To initialize the project:
```
npm install
```

To run all tests:
```
npm test
```

To run only end-to-end test:
```
npm run test:e2e
```

To run dev environment (auto-restart when changes are detected):
```
npm run start:dev
```

## Requirements

1. `.env` file is **REQUIRED**:
```env
PORT= [Your deployment port]
FIREBASE_APIKEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_DB_URL = 
FIREBASE_PROJ_ID = 
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSANGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENTID=
```

2. Data plugin is **REQUIRED**:

Plugins have to be declared in ``./src/plugins/plugins.json``. An example will be given bellow:

``` json
{
    "example.com": {
        "name":     "Example source",
        "source":   "example.com",
        "type":     "Crime map",
        "class":    "ExamplePlugin",
        "location": "./ExamplePlugin/ExamplePlugin.ts"
    }
}
```

And in ``./src/plugins/ExamplePlugin/ExamplePlugin.ts``, the class must implement ``ICrimeDataPlugin``:

``` ts
export class CrimeMappingPlugin implements ICrimeDataPlugin {
    pluginName: string;
    dataSourceName: string;

    constructor() {
        this.pluginName = "Crime Mapping Plugin";
        this.dataSourceName = "Crime Mapping";
    }

    async getCrimes(polygon: IPolygon, out: ICrime[]): Promise<ICrime[]> {
        // Put your code to get the crime data overhere
    }
}
```
