export class Debug {
    private static Box : HTMLElement;

    static Initiate() {
        Debug.Box = document.getElementById('debug-content') as HTMLElement;
    }

    static Clear() {
        this.Box.innerHTML = "";
    }

    static Add(text : string) {
        Debug.Box.innerHTML += "<br>" + text;
    }
}