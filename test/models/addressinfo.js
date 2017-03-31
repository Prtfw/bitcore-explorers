'use strict';

var should = require('chai').should();

var explorers = require('../../');
var AddressInfo = explorers.models.AddressInfo;

describe('AddressInfo', function() {

  describe('instantiation', function() {

    var data = require('./sampleAddressFromInsight.json');
    var addressInfo = AddressInfo.fromInsight(data);


    it('works with both strings and objects', function() {
      AddressInfo.fromInsight(JSON.stringify(data)).should.deep.equal(addressInfo);
    });

    it('parses correctly a sample response on Insight for address XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK', function() {
      should.exist(addressInfo);
      addressInfo.address.toString().should.equal('XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK');
      addressInfo.balance.should.equal(1000);
      addressInfo.totalSent.should.equal(1000);
      addressInfo.totalReceived.should.equal(1000);
      addressInfo.unconfirmedBalance.should.equal(1000);
      addressInfo.transactionIds.length.should.equal(444);
    });

    it('returns the same instance if an AddressInfo is provided', function() {
      (new AddressInfo(addressInfo)).should.equal(addressInfo);
    });

    it('can be instantiated without new', function() {
      (AddressInfo(addressInfo)).should.equal(addressInfo);
    });

  });

});
