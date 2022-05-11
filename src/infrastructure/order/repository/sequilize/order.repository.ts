import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
  async update(entity: Order): Promise<void> {
    // const sequelize = OrderModel.sequelize;
    // await sequelize.transaction(async (t) => {
    //   await OrderItemModel.destroy({
    //     where: { order_id: entity.id },
    //     transaction: t,
    //   });
    //   const items = entity.items.map((item) => ({
    //     id: item.id,
    //     name: item.name,
    //     price: item.price,
    //     product_id: item.productId,
    //     quantity: item.quantity,
    //     order_id: entity.id,
    //   }));
    //   await OrderItemModel.bulkCreate(items, { transaction: t });
    //   await OrderModel.update(
    //     { total: entity.total() },
    //     { where: { id: entity.id }, transaction: t }
    //   );
    // });

    const order = await OrderModel.findOne({
      where: {
        id: entity.id,
      },
      include: [{ model: OrderItemModel }],
    });

    entity.items.map((item) => {
      const ordemItem = new OrderItemModel({
        id: item.id,
        product_id: item.productId,
        order_id: order.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
      });
      OrderItemModel.upsert(ordemItem.toJSON());
    });
    order.update({ total: entity.total() });
  }
  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
        include: [{ model: OrderItemModel }],
      });
    } catch (error) {
      throw new Error("Order not found");
    }
    return orderModel.toJSON();
  }

  async findAll(): Promise<Order[]> {
    let orderModels = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });
    const orders = orderModels.map((orderModels) => {
      const items = orderModels.items.map((item) => {
        let orderItem = new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        );
        return orderItem;
      });
      let order = new Order(orderModels.id, orderModels.customer_id, items);
      return order;
    });
    return orders;
  }
}
