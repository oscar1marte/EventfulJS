const isPromise = (value) => {
  return value && typeof value.then === 'function';
}

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

  //then(onFulfilled, onRejected) {
  //let nextPromise = new PeagolPromise(() => { });
  //if (typeof onFulfilled === 'function' && !this.reason) {
  //if (this.state === 'PENDING') {
  //this.pendings.push(onFulfilled);
  //} else {
  //try {
  //value = onFulfilled(this.value);
  //nextPromise.state = 'FULFILLED';
  //nextPromise.value = value;
  //} catch (e) {
  //nextPromise.state = 'REJECTED';
  //nextPromise.reason = e;
  //}
  //return nextPromise;
  //}
  //}
  //if (typeof onRejected === 'function' && !this.value) {
  //if (this.state === 'PENDING') {
  //this.errs.push(onRejected);
  //} else {
  //try {
  //value = onRejected(this.reason);
  //nextPromise.state = 'FULFILLED';
  //nextPromise.value = value;
  //} catch (e) {
  //nextPromise.state = 'REJECTED';
  //nextPromise.reason = e;
  //}
  //return nextPromise;
  //}
  //}
  //return nextPromise;
  //}

  then(onFulfilled, onRejected) {
    return new PeagolPromise((fulfill, reject) => {
      const handleOnFulfilled = (value) => {
        if (typeof onFulfilled === 'function') {
          try {
            result = onFulfilled(value);
            this.state = 'FULFILLED';
            this.value = result;
          } catch (e) {
            this.state = 'REJECTED';
            this.reason = e;
          }
        }
      }

      const handleOnRejected = (reason) => {
        if (typeof onRejected === 'function') {
          try {
            result = onRejected(reason);
            this.state = 'FULFILLED';
            this.value = result;
          } catch (e) {
            this.state = 'REJECTED';
            this.reason = e;
          }
        }
      }

      if (this.state === 'PENDING') {
        this.pendings.push(handleOnFulfilled);
        this.errs.push(handleOnRejected)
      } else {
        setTimeout(() => {
          handleOnFulfilled();
        }, 0);

        setTimeout(() => {
          handleOnRejected();
        }, 0);
      }
    });
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
