import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Router, Route, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import * as fromRoot from '../app.reducer'

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
    constructor(private store:Store<fromRoot.State>, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(this.store.select(fromRoot.getIsAuth).pipe(take(1))) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }

    canLoad(route: Route) {
        if(this.store.select(fromRoot.getIsAuth).pipe(take(1))) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}