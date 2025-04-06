const isPromise = (value) => {
  if (value && typeof value.then == 'function') {
    return true;
  } else {
    return false;
  }
}

class PeagolPromise {
  constructor(executor) {
    this.state = 'PENDING';
    this.pendings = [];
    this.value;
    executor(this.resolve.bind(this), () => { });
    //setTimeout(() => {
    //this.resolve();
    //}, 1000);
  }

  then(onFulfilled, onRejected) {
    if (typeof onFulfilled != 'function') {
      return this
    }
    if (this.state === 'PENDING') {
      this.pendings.push(onFulfilled);
    } else {
      this.value = onFulfilled(this.value);
    }
    return this
  }

  resolve(value) {
    if (this.state === 'PENDING') {
      this.value = value;
      for (let i = 0, ii = this.pendings.length; i < ii; i++) {
        let callback = this.pendings[i];
        callback(this.value);
      }
      this.state = 'FULFILLED';
    }
  }
}

export default PeagolPromise;
