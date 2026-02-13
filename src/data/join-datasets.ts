import type { Table } from '../types';

export const customersTable: Table = {
  id: 'customers',
  name: 'Customers',
  columns: [
    { id: 'customer_id', name: 'customer_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'name', name: 'name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'city', name: 'city', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'cust-1', cells: { customer_id: 1, name: 'Alice', city: 'New York' } },
    { id: 'cust-2', cells: { customer_id: 2, name: 'Bob', city: 'Chicago' } },
    { id: 'cust-3', cells: { customer_id: 3, name: 'Carol', city: 'Boston' } },
    { id: 'cust-4', cells: { customer_id: 4, name: 'Dave', city: 'Seattle' } },
    { id: 'cust-5', cells: { customer_id: 5, name: 'Eve', city: 'Miami' } },
  ],
};

export const ordersTable: Table = {
  id: 'orders',
  name: 'Orders',
  columns: [
    { id: 'order_id', name: 'order_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    { id: 'customer_id', name: 'customer_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'customers', columnId: 'customer_id' }, isNullable: false },
    { id: 'product', name: 'product', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
    { id: 'amount', name: 'amount', type: 'DECIMAL', isPrimaryKey: false, isForeignKey: false, isNullable: false },
  ],
  rows: [
    { id: 'ord-101', cells: { order_id: 101, customer_id: 1, product: 'Laptop', amount: 999.99 } },
    { id: 'ord-102', cells: { order_id: 102, customer_id: 2, product: 'Phone', amount: 699.99 } },
    { id: 'ord-103', cells: { order_id: 103, customer_id: 1, product: 'Tablet', amount: 449.99 } },
    { id: 'ord-104', cells: { order_id: 104, customer_id: 3, product: 'Monitor', amount: 349.99 } },
    { id: 'ord-105', cells: { order_id: 105, customer_id: 2, product: 'Keyboard', amount: 79.99 } },
    { id: 'ord-106', cells: { order_id: 106, customer_id: 99, product: 'Mouse', amount: 29.99 } },
  ],
};
