import { from, fromEvent, Observable, ReplaySubject, } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';
import { filter } from 'rxjs/internal/operators/filter';

const search: FromEventTarget<KeyboardEvent> = document.getElementById('searchbox') as FromEventTarget<KeyboardEvent>;
const elem: HTMLInputElement = document.getElementById('searchbox') as HTMLInputElement;
const results: HTMLUListElement = document.getElementById('results') as HTMLUListElement;

const keyPause$: ReplaySubject<string> = fromEvent<KeyboardEvent>(search, 'keyup').pipe(
    debounceTime(1000),
    map((event:  KeyboardEvent) => event.key),
) as ReplaySubject<string>;

// tslint:disable-next-line:no-any
function request$(txt: string): Observable<any> {
    return from(fetch('https://api.github.com/search/repositories?q=' + txt + '&sort=stars&order=desc')
        .then((res: Response) => res.json()));
}

keyPause$.pipe(
    filter((_val: string) => elem.value.length > 0),
    switchMap((_val: string) => request$(elem.value),
// tslint:disable-next-line:no-any
    (_: any, data: any) => data)).subscribe((result: any) => {
        while (results.firstChild ) {
            results.removeChild(results.firstChild);
        }

        for (const item of result.items) {
            const li: HTMLLIElement = document.createElement('li');
            li.appendChild(document.createTextNode(item.html_url));
            results.appendChild(li);
        }
    });
