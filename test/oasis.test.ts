import { expect } from 'chai'
import { ethers } from 'hardhat'

import { OasisCustomerBase } from './exchange/oasisCustomer'
import { OrderBook } from './exchange/orderBook'
import { loadFixtureAdapter } from './fixtures/loadFixture'
import { noEscrowFixture } from './fixtures/noEscrow'
import { bn, dai, eth, mkr } from './utils/units'

describe('general', () => {
  let orderBook: OrderBook
  let customer: OasisCustomerBase

  beforeEach(async () => {
    ;({ alice: customer, orderBook } = await loadFixtureAdapter(await ethers.getSigners())(noEscrowFixture))
  })

  it('adds order to an empty order book', async () => {
    await customer.sell(eth('100'), dai('2'), 0)
    const headOrder = await orderBook.sellOrder(0)
    const makeOrder = await orderBook.sellOrder(2)

    expect(headOrder.prev).to.eq(bn('2'))
    expect(headOrder.next).to.eq(bn('2'))
    expect(makeOrder.baseAmt).to.eq(eth('100'))
    expect(makeOrder.prev).to.eq(bn('0'))
    expect(makeOrder.next).to.eq(bn('0'))
  })

  it('sorts buy orders desc', async () => {
    await customer.buy(mkr('1'), dai('400'), 0)
    await customer.buy(mkr('1'), dai('500'), 0)
    expect((await orderBook.buyOrderAtIndex(0)).price).to.eq(dai('500'))
    expect((await orderBook.buyOrderAtIndex(1)).price).to.eq(dai('400'))
  })

  it('sorts sell orders asc', async () => {
    await customer.sell(mkr('1'), dai('500'), 0)
    await customer.sell(mkr('1'), dai('400'), 0)
    expect((await orderBook.sellOrderAtIndex(0)).price).to.eq(dai('400'))
    expect((await orderBook.sellOrderAtIndex(1)).price).to.eq(dai('500'))
  })
})
