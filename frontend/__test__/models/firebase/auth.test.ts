import { Auth } from "../../../src/firebase/auth";
import { UserData } from "../../../src/firebase/auth";
import { sanitizeEmail } from "../../../src/utils/auth";

jest.setTimeout(30000);


describe("test user register", () => {
    it("should successfully save the data", async () => {
        const auth = new Auth();
        const user : UserData = {
            email: "star.phamhomanhtu@gmail.com",
            fullName: "Tu Pham",
            lastLogin: new Date(),
            role: "regular",
            plans: []
        }
        await auth.register(user.email,  "manhtu123", user)
        const actualUser = await auth.getOne(sanitizeEmail(user.email))

        console.log(actualUser);

        expect(actualUser).toBe(user)
    })
})