import { from, fromEvent, Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { filter } from 'rxjs/internal/operators/filter';

const elem: HTMLInputElement = document.getElementById('searchbox') as HTMLInputElement;
const results: HTMLUListElement = document.getElementById('results') as HTMLUListElement;

const keyPause$: Observable<string> = fromEvent(elem, 'input').pipe(
    debounceTime(1000),
    map((event:  Event) => event.type),
) as Observable<string>;

// tslint:disable-next-line:no-any
function request$(txt: string): Observable<any> {
    return from(fetch(`https://api.github.com/search/repositories?q=${txt}&sort=stars&order=desc`)
        .then((res: Response) => res.json()));
}

keyPause$.pipe(
    filter((_: string) => typeof(elem.value) !== undefined && elem.value.length > 0),
    // tslint:disable-next-line:no-any
    switchMap((_: string) => request$(elem.value), (_: any, data: any) => data)).subscribe((result: any) => {
        while (results.firstChild ) {
            results.removeChild(results.firstChild);
        }
        for (const item of result.items) {
            const li: HTMLLIElement = document.createElement('li');
            li.innerHTML = `<a href="${item.html_url}">${item.html_url}</a>`;
            results.appendChild(li);
        }
    });
