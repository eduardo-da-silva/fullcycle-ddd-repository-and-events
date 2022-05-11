import Address from "../value-object/address";
import SendConsoleLog1WhenCustomerIsCreated from "../event/handler/send-console-log1-when-customer-created.handler";
import SendConsoleLog2WhenCustomerIsCreated from "../event/handler/send-console-log2-when-customer-created.handler";
import SendConsoleLogWhenCustomerAddressIsChanged from "../event/handler/send-console-log-when-customer-address-changed.handler";
import CustomerCreatedEvent from "../event/customer-created.event";
import CustomerAddressChangedEvent from "../event/customer-address-changed.event";
import EventDispatcher from "../../@shared/event/event-dispatcher";

export default class Customer {
  private _id: string;
  private _name: string = "";
  private _address!: Address;
  private _active: boolean = false;
  private _rewardPoints: number = 0;

  constructor(id: string, name: string) {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new SendConsoleLog1WhenCustomerIsCreated();
    const eventHandler2 = new SendConsoleLog2WhenCustomerIsCreated();

    this._id = id;
    this._name = name;
    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);
    const customerCreatedEvent = new CustomerCreatedEvent({
      id,
      name,
    });
    eventDispatcher.notify(customerCreatedEvent)
    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get rewardPoints(): number {
    return this._rewardPoints;
  }

  validate() {
    if (this._id.length === 0) {
      throw new Error("Id is required");
    }
    if (this._name.length === 0) {
      throw new Error("Name is required");
    }
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  get Address(): Address {
    return this._address;
  }
  
  changeAddress(address: Address) {
    this._address = address;
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendConsoleLogWhenCustomerAddressIsChanged();
    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);
    const customerAddressChangedEvent = new CustomerAddressChangedEvent({
      id: this._id,
      name: this._name,
      address
    });
    eventDispatcher.notify(customerAddressChangedEvent)
  }

  isActive(): boolean {
    return this._active;
  }

  activate() {
    if (this._address === undefined) {
      throw new Error("Address is mandatory to activate a customer");
    }
    this._active = true;
  }

  deactivate() {
    this._active = false;
  }

  addRewardPoints(points: number) {
    this._rewardPoints += points;
  }

  set Address(address: Address) {
    this._address = address;
  }
}
