class DownloadManager {
    constructor(maxConcurrentRequests) {
      this.queue = [];
      this.maxConcurrentRequests = maxConcurrentRequests;
      this.currentlyRunning = 0;
    }
  
    addToQueue(url, init, priority, onFulfilled, onRejected) {
      const request = { url, init, priority, onFulfilled, onRejected };
      if (priority === 'high') {
        this.queue.unshift(request);
      } else {
        this.queue.push(request);
      }
      
      if (this.currentlyRunning < this.maxConcurrentRequests && this.queue.length > 0) {
        this.processNext();
      }
    }
  
    async fetch(url, init, priority) {
      return new Promise((resolve, reject) => {
        const handleResult = (data) => resolve(data);
        const handleError = (error) => reject(error);
  
        this.addToQueue(url, init, priority, handleResult, handleError);
      });
    }
  
    processNext() {
      if (this.queue.length === 0 || this.currentlyRunning >= this.maxConcurrentRequests) {
        return;
      }
  
      this.currentlyRunning++;
      const nextRequest = this.queue.shift();
  
      window.fetch(nextRequest.url, nextRequest.init)
        .then(response => response)
        .then(data => {
          nextRequest.onFulfilled(data);
          this.currentlyRunning--;
          this.processNext();
        })
        .catch(error => {
          nextRequest.onRejected(error);
          this.currentlyRunning--;
          this.processNext();
        });
    }
}

class ServerAPI {
    static async get(server, what = "", priority = "low") {
        let response;
        try {
            response = await Core.DM.fetch(`https://migrenoznik.ru/api/${server}?${what}`, {
                method: 'GET'
            }, priority);
        } catch (error) {
            if (error.message == "Failed to fetch") {
                throw new TypeError("FETCH_FAILED");
            }
            if (error.message == "net::ERR_INTERNET_DISCONNECTED") {
                throw new TypeError("FETCH_FAILED");
            }
            throw new TypeError("FETCH_FAILED");
        }
        let text = await response.text();
        return text;
    }

    static async test() {
        try {
            let rnd = Math.random() * 2000;
            let response = await this.get('test_connection', `value=${rnd}`, "low");
            if (rnd == response) {
                return 'OK';
            } else {
                return 'BAD_ANSWER';
            }
        } catch (error) {
            if (window.navigator.onLine) {
                return 'NO_CONNECTION';
            } else {
                return 'NO_INTERNET';
            }
            
        }
    }
}