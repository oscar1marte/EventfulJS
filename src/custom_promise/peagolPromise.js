class PeagolPromise {
  constructor(executor) {
    this.state = 'PENDING';
    this.pendings = [];
    this.errs = [];
    this.value;
    this.reason;

    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    let nextPromise = new PeagolPromise(() => { });
    if (typeof onFulfilled === 'function' && !this.reason) {
      if (this.state === 'PENDING') {
        this.pendings.push(onFulfilled);
      } else {
        try {
          value = onFulfilled(this.value);
          nextPromise.state = 'FULFILLED';
          nextPromise.value = value;
        } catch (e) {
          nextPromise.state = 'REJECTED';
        }
        return nextPromise;
      }
    }
    if (typeof onRejected === 'function' && !this.value) {
      if (this.state === 'PENDING') {
        this.errs.push(onRejected);
      } else {
        try {
          value = onRejected(this.reason);
          nextPromise.state = 'FULFILLED';
          nextPromise.value = value;
        } catch (e) {
          nextPromise.state = 'REJECTED';
          nextPromise.reason = e;
        }
        return nextPromise;
      }
    }
    return nextPromise;
  }

  resolve(value) {
    if (this.state === 'PENDING') {
      this.value = value;
      this.state = 'FULFILLED';
      for (let i = 0, ii = this.pendings.length; i < ii; i++) {
        let callback = this.pendings[i];
        callback(this.value);
      }
    }
  }

  reject(reason) {
    if (this.state === 'PENDING') {
      this.reason = reason;
      this.state = 'REJECTED';
      for (let j = 0, jj = this.errs.length; j < jj; j++) {
        let errback = this.errs[j];
        errback(this.reason);
      }
    }
  }
}

export default PeagolPromise;
