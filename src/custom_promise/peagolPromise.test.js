import { describe, it, jest } from '@jest/globals'
import peagolPromise from "./peagolPromise.js";


/*
 All of these tests are possible thanks to Mauricio Poppe, so all credit goes to him:
 https://www.mauriciopoppe.com/notes/computer-science/computation/promises/
*/
describe("peagolPromiseTest", () => {
  it("receives a executor function when constructed which is called immediately", () => {
    const executor = jest.fn();
    const promise = new peagolPromise(executor);
    expect(executor.mock.calls.length).toBe(1);
    expect(typeof executor.mock.calls[0][0]).toBe("function");
    expect(typeof executor.mock.calls[0][1]).toBe("function");
  });

  it("is in a PENDING state", () => {
    const promise = new peagolPromise(function executor(fulfill, reject) { })
    expect(promise.state).toBe("PENDING")
  });

  it("transition to the FULFILLED state with a `value`", () => {
    const value = ":)"
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill(value);
    })
    expect(promise.state).toBe("FULFILLED");
  });

  it("transition to the REJECTED state with a `reason`", () => {
    const reason = "I failed :("
    const promise = new peagolPromise((fulfill, reject) => {
      reject(reason);
    })
    expect(promise.state).toBe("REJECTED");
  })

  it("should have a .then method", () => {
    const promise = new peagolPromise(() => { });
    expect(typeof promise.then).toBe("function");
  });

  it("should call the onFulfilled method when a promise is in a a FULFILLED state", () => {
    const value = ":)";
    const onFulfilled = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill(value);
    }).then(onFulfilled);
    expect(onFulfilled.mock.calls.length).toBe(1);
    expect(onFulfilled.mock.calls[0][0]).toBe(value);
  });

  it("transition to the REJECTED state with a reason", () => {
    const reason = "I failed :(";
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      reject(reason);
    }).then(null, onRejected);
    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
  });

  it("when a promise is FULFILLED it should not be REJECTED with another value", () => {
    const value = ":)";
    const reason = "I failed :(";
    const onFulfilled = jest.fn();
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill(value);
      reject(reason);
    });
    promise.then(onFulfilled, onRejected);
    expect(onFulfilled.mock.calls.length).toBe(1);
    expect(onFulfilled.mock.calls[0][0]).toBe(value);
    expect(onRejected.mock.calls.length).toBe(0);
    expect(promise.state).toBe("FULFILLED");
  });

  it("when a promise is REJECTED it should not be FULFILLED with another value", () => {
    const value = ":)";
    const reason = "I failed :(";
    const onFulfilled = jest.fn();
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      reject(reason);
      fulfill(value);
    });
    promise.then(onFulfilled, onRejected);
    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
    expect(onFulfilled.mock.calls.length).toBe(0);
    expect(promise.state).toBe("REJECTED");
  });

  it("when the executor fails the promise should transition to the REJECTED state", () => {
    const reason = new Error("I failed :(");
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      throw reason;
    });

    promise.then(() => { }, onRejected);
    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
    expect(promise.state).toBe("REJECTED");
  });

  it("should queue callbacks when the promise is not fulfilled immediately", (done) => {
    const value = ":)";
    const promise = new peagolPromise((fulfill, reject) => {
      setTimeout(fulfill, 1, value);
    })
    const onFulfilled = jest.fn();
    promise.then(onFulfilled, () => { });
    setTimeout(() => {
      expect(onFulfilled.mock.calls.length).toBe(1);
      expect(onFulfilled.mock.calls[0][0]).toBe(value);
      promise.then(onFulfilled, () => { });
    }, 5);

    expect(onFulfilled.mock.calls.length).toBe(0);

    setTimeout(() => {
      expect(onFulfilled.mock.calls.length).toBe(2);
      expect(onFulfilled.mock.calls[1][0]).toBe(value);
      done();
    }, 10);
  });

  it("should queue callbacks when the promise is not rejected immediately", (done) => {
    const reason = "I failed :(";
    const promise = new peagolPromise((fulfill, reject) => {
      setTimeout(reject, 1, reason);
    })

    const onRejected = jest.fn();
    promise.then(() => { }, onRejected);
    setTimeout(() => {
      expect(onRejected.mock.calls.length).toBe(1);
      expect(onRejected.mock.calls[0][0]).toBe(reason);
      promise.then(() => { }, onRejected);
    }, 5);

    expect(onRejected.mock.calls.length).toBe(0);

    setTimeout(() => {
      expect(onRejected.mock.calls.length).toBe(2);
      expect(onRejected.mock.calls[1][0]).toBe(reason);
      done();
    }, 10);
  });

  it(".then should return a new promise", () => {
    expect(() => {
      const qOnFulfilled = jest.fn();
      const rOnFulfilled = jest.fn();
      const p = new peagolPromise((fulfill, reject) => {
        fulfill();
      });
      const q = p.then(qOnFulfilled, () => { });
      const r = q.then(rOnFulfilled, () => { });
    }).not.toThrow();
  });

  it("if .then`s onFulfilled is called without errors it should transition to FULFILLED", () => {
    const value = ":)";
    const onFulfilled = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill();
    }).then(() => {
      return value;
    }).then(onFulfilled);

    expect(onFulfilled.mock.calls.length).toBe(1);
    expect(onFulfilled.mock.calls[0][0]).toBe(value);
  });

  it("if .then`s onRejected is called without errors it should transition to FULFILLED", () => {
    const value = ":)";
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      reject();
    }).then(() => {
      return value;
    }).then(onRejected);

    expect(onRejected.mock.calls.length).toBe(1)
    expect(onRejected.mock.calls[0][0]).toBe(value);
  });

  it("if .then`s onFulfilled is called and has an error it should transition to REJECTED", () => {
    const reason = new Error("I failed :(");
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill();
    }).then(() => {
      throw reason;
    }, () => { }).then(() => { }, onRejected);

    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
  });

  it("if .then`s onRejected is called and has an error it should transition to REJECTED", () => {
    const reason = new Error("I failed :(");
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      reject();
    }).then(() => { }, () => {
      throw reason;
    }).then(() => { }, onRejected);

    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
  });

  it("if a handler returns a promise, the previous promise should adopt the state of the returned promise", () => {
    const value = ":)";
    const onFulfilled = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill();
    }).then(() => {
      return new peagolPromise((fulfill, reject) => {
        fulfill(value);
      })
    }).then(onFulfilled);
    expect(onFulfilled.mock.calls.length).toBe(1);
    expect(onFulfilled.mock.calls[0][0]).toBe(value);
  });

  it("if a handler returns a promise resolved in the future, the previous promise should adopt its value", (done) => {
    const value = ":)";
    const onFulfilled = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      setTimeout(fulfill, 0);
    }).then(() => {
      return new peagolPromise((fulfill, reject) => {
        setTimeout(fulfill, 0, value);
      });
    }, () => { }).then(onFulfilled, () => { });
    setTimeout(() => {
      expect(onFulfilled.mock.calls.length).toBe(1);
      expect(onFulfilled.mock.calls[0][0]).toBe(value);
      done();
    }, 10);
  });

  it("works with invalid handlers (fulfill)", () => {
    const value = ":)";
    const onFulfilled = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill(value);
    });
    const q = promise.then(null, () => { });
    q.then(onFulfilled, () => { });

    expect(onFulfilled.mock.calls.length).toBe(1);
    expect(onFulfilled.mock.calls[0][0]).toBe(value);
  });

  it("works with invalid handlers (reject)", () => {
    const reason = "I failed :(";
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      reject(reason);
    })
    const q = promise.then(null, null);
    q.then(null, onRejected);

    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
  });

  it("the promise observers are called after the event loop", (done) => {
    const value = ":)";
    const onFulfilled = jest.fn();
    let resolved = false;

    const promise = new peagolPromise((fulfill, reject) => {
      fulfill(value);
      resolved = true;
    }).then(onFulfilled, () => { });

    expect(onFulfilled.mock.calls.length).toBe(0);

    setTimeout(() => {
      expect(onFulfilled.mock.calls.length).toBe(1);
      expect(onFulfilled.mock.calls[0][0]).toBe(value);
      expect(resolved).toBe(true);
      done();
    }, 10);
  });

  it("rejects with a resolved promise", (done) => {
    const value = ":)";
    const reason = new peagolPromise((fulfill, reject) => {
      fulfill(value);
    });
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill();
    }).then(() => {
      throw reason;
    }).then(null, onRejected);

    expect(onRejected.mock.calls.length).toBe(0);

    setTimeout(() => {
      expect(onRejected.mock.calls.length).toBe(1);
      expect(onRejected.mock.calls[0][0]).toBe(reason);
      done();
    }, 10);
  });

  it("should throw when attempted to be resolved with itseft", (done) => {
    const onRejected = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill();
    });
    const q = promise.then(() => {
      return q;
    }, () => { });
    q.then(null, onRejected);

    setTimeout(() => {
      expect(onRejected.mock.calls.length).toBe(1);
      expect(onRejected.mock.calls[0][0] instanceof TypeError).toBe(true);
      done()
    }, 10);
  });

  it("should work with thenables", () => {
    const value = ":)";
    const thenable = {
      then: (fulfill) => {
        fulfill(value);
      }
    };
    const onFulfilled = jest.fn();
    const promise = new peagolPromise((fulfill, reject) => {
      fulfill(value);
    }).then(() => {
      return thenable;
    }).then(onFulfilled);

    setTimeout(() => {
      expect(onFulfilled.mock.calls.length).toBe(1);
      expect(onFulfilled.mock.calls[0][0]).toBe(value);
      done();
    }, 10);
  });
});

