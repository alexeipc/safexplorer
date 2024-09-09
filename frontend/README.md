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

## Rules

1.  A new branch **MUST** be created whenever a feature is changed.

2. **DO NOT** merge directly into main branch. Feature changes **MUST** only be merged into **dev** branch.

3. **READ** carefully `Rules.md` file in every model folder.

4. `.env` file is **REQUIRED**.

5. Variables and functions must be written in Camel Case with the first lowercase letter. Classes must be written in Camel Case with the first uppercase letter. Constants must be written in Screaming Snake Case (all capitialized). Example:

``` ts
class Hello {
    readonly PI_VALUE: Number = 3.1415

    public printHelloWorld(): void {
        let helloWorld:string = "Hello world!";
        console.log(helloWorld);
    }
}
```

6. Handlers must be tested using unit tests in folder `__test__/models/routes` (see test samples in the same folder).

7. End-to-end test must be placed in `__test__/e2e` (see test samples in the same folder).