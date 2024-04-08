export class ReactiveData<T> {
  private _value: T
  private _listeners: ((value: T) => void)[] = []

  constructor(value: T) {
    this._value = value
  }

  get value(): T {
    return this._value
  }

  set value(newValue: T) {
    this._value = newValue
    this.notifyListeners()
  }

  subscribe(listener: (value: T) => void) {
    this._listeners.push(listener)
  }

  notifyListeners() {
    this._listeners.forEach((listener) => {
      listener(this._value)
    })
  }
}
