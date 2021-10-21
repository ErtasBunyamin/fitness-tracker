import { Subject } from "rxjs";

import { AuthData } from "./auth-data.model";
import { User } from "./user.model";

export class AuthService {
    private user: User;
    authChange = new Subject<boolean>();

    registerUser(authData: AuthData) {
        this.user = {
            email: authData.email,
            userId: Math.round(Math.random() *10000).toString()
        };
        this.authChange.next(true);
    }

    login(authData: AuthData) {
        this.user = {
            email: authData.email,
            userId: Math.round(Math.random() *10000).toString()
        };
        this.authChange.next(true);
    }

    logout() {
        this.user = null;
        this.authChange.next(false);
    }

    getUser() {
        return this.user;
    }

    isAuth() {
        return this.user != null;
    }
}