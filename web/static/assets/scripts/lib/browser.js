class BrowserSystem {
    /**
     * Is website launched as standalone application.
     * @returns _true_ if as standalone, _false_ if as website
     */
    static is_standalone() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://')) {
          return true;
        }
        return false;
    }
}