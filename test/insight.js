'use strict';

var sinon = require('sinon');
var should = require('chai').should();
var expect = require('chai').expect;
var bitcore = require('bitcore-lib-dash');
var explorers = require('../');

var Insight = explorers.Insight;
var Address = bitcore.Address;
var Transaction = bitcore.Transaction;
var AddressInfo = explorers.models.AddressInfo;
var Networks = bitcore.Networks;

describe('Insight', function() {

  describe('instantiation', function() {
    it('can be created without any parameters', function() {
      var insight = new Insight();
      should.exist(insight.url);
      should.exist(insight.network);
      if (insight.network === Networks.livenet) {
        insight.url.should.equal('http://insight.dash.org');
      } else if (insight.network === Networks.testnet) {
        insight.url.should.equal('http://test-insight.dash.org');
      }
    });
    it('can be created providing just a network', function() {
      var insight = new Insight(Networks.testnet);
      insight.url.should.equal('http://test-insight.dash.org');
      insight.network.should.equal(Networks.testnet);
    });
    it('can be created with a custom url', function() {
      var url = 'https://localhost:1234';
      var insight = new Insight(url);
      insight.url.should.equal(url);
    });
    it('can be created with a custom url and network', function() {
      var url = 'https://localhost:1234';
      var insight = new Insight(url, Networks.testnet);
      insight.url.should.equal(url);
      insight.network.should.equal(Networks.testnet);
    });
    it('defaults to defaultNetwork on a custom url', function() {
      var insight = new Insight('https://localhost:1234');
      insight.network.should.equal(Networks.defaultNetwork);
    });
  });

  describe('getting unspent utxos', function() {
    var insight = new Insight();
    var address = 'XhQoYBRjc5R5K3LW9gxoWPrbecWGdU4hnX';
    beforeEach(function() {
      insight.requestPost = sinon.stub();
      insight.requestPost.onFirstCall().callsArgWith(2, null, {
        statusCode: 200
      });
    });
    it('can receive an address', function(callback) {
      insight.getUtxos(new Address(address), callback);
    });
    it('can receive a address as a string', function(callback) {
      insight.getUtxos(address, callback);
    });
    it('can receive an array of addresses', function(callback) {
      insight.getUtxos([address, new Address(address)], callback);
    });
    it('errors if server is not available', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, 'Unable to connect');
      insight.getUtxos(address, function(error) {
        expect(error).to.equal('Unable to connect');
        callback();
      });
    });
    it('errors if server returns errorcode', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, null, {
        statusCode: 400
      });
      insight.getUtxos(address, function(error) {
        expect(error).to.deep.equal({
          statusCode: 400
        });
        callback();
      });
    });
    it('errors if server returns invalid data', function(callback) {
      var invalidUtxo = {
        address: 'XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK', //2MvQs7cJe49fbukkTLwhSYnV3hSXe6Bu8tb
        txid: '7d1eea0c7bed061a6ce1b49d57ef385621766e765bc3ed48bde04d816a4c3ea8',
        vout: 1,
        ts: 1428103500,
        amount: 0.000198,
        confirmations: 6,
        confirmationsFromCache: true
      };
      insight.requestPost.onFirstCall().callsArgWith(2, null, {
        statusCode: 200
      }, [invalidUtxo]);
      insight.getUtxos(address, function(error, unspent) {
        expect(error).to.exist;
        expect(error.name).to.equal('bitcore.ErrorInvalidArgument');
        expect(error.toString()).to.contain('scriptPubKey');
        callback();
      });
    });
  });

  describe('broadcasting a transaction', function() {
    var insight = new Insight();
    beforeEach(function() {
      insight.requestPost = sinon.stub();
      insight.requestPost.onFirstCall().callsArgWith(2, null, {
        statusCode: 200
      });
    });
    it('accepts a raw transaction', function(callback) {
      insight.broadcast(rawTx, callback);
    });
    it('accepts a transaction model', function(callback) {
      var tx = new Transaction()
        .from({
          "txid": "e42447187db5a29d6db161661e4bc66d61c3e499690fe5ea47f87b79ca573986",
          "vout": 1,
          "address": "XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK",
          "scriptPubKey": "76a914073b7eae2823efa349e3b9155b8a735526463a0f88ac",
          "amount": 0.01080000
        })
        .to("XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK", 500000)
        .change("XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK")
        .sign("cSQUuwwJBAg6tYQhzqqLWW115D1s5KFZDyhCF2ffrnukZxMK6rNZ");
      insight.broadcast(tx, callback);
    });
    it('errors if server is not available', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, 'Unable to connect');
      insight.broadcast(rawTx, function(error) {
        expect(error).to.equal('Unable to connect');
        callback();
      });
    });
    it('errors if server returns errorcode', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, null, {
        statusCode: 400
      }, 'error');
      insight.broadcast(rawTx, function(error) {
        expect(error).to.equal('error');
        callback();
      });
    });
  });

    describe('get information about masternodes', function() {
        var insight = new Insight(Networks.testnet);
        var data = [ { vin: '3e739c0219595365c28cb8e14606f18d183500ee13bbedfee8c755a502cbc70a-1',
            status: 'NEW_START_REQUIRED',
            protocol: '70206',
            payee: 'yXXQNnSDhijos1Ucq9NiJMEcFRF6nZGjKq',
            lastseen: '1486207842',
            activeseconds: '170674',
            lastpaidtime: '0',
            lastpaidblock: '0',
            IP: '88.99.15.34:19999' },
            { vin: 'a9dec34daa02d7537d47cefdb2c5131585f97eb8b90c1ccf63675ed3129ca704-1',
                status: 'ENABLED',
                protocol: '70206',
                payee: 'yaffS5bPkfZ211SXbvNyQxFRRP5tL2dZtN',
                lastseen: '1491488457',
                activeseconds: '680597',
                lastpaidtime: '1491482871',
                lastpaidblock: '179902',
                IP: '217.182.229.136:19999' },
            { vin: '88f33da9565bfa2e793402900a894d55ad96039c82ca0ef6919d33141761c4c9-0',
                status: 'NEW_START_REQUIRED',
                protocol: '70206',
                payee: 'yTJSNXHqp1uxSTVQDm1abPUsQJKgvcUqsb',
                lastseen: '1487206254',
                activeseconds: '302622',
                lastpaidtime: '0',
                lastpaidblock: '0',
                IP: '5.45.104.74:19999' },
            { vin: 'c5eb806fdce3b6bbe3a6427848d022bdd650899b74c36eb7f607daa3bc3d0f5d-0',
                status: 'ENABLED',
                protocol: '70206',
                payee: 'yj6xVHMyZGBdLqGUfoGc9gDvU8tHx6iqb4',
                lastseen: '1491488460',
                activeseconds: '680599',
                lastpaidtime: '1491482010',
                lastpaidblock: '179897',
                IP: '217.182.229.146:19999' },
            { vin: '99fdd9d9b7b690821f931550fb0f416ece12e3d764c7cc4b7102839953debdc0-0',
                status: 'ENABLED',
                protocol: '70206',
                payee: 'yYry7hgW9SX9V737xrAkYf4fXCYKrGwEWh',
                lastseen: '1491488192',
                activeseconds: '680331',
                lastpaidtime: '1491481271',
                lastpaidblock: '179889',
                IP: '217.182.229.143:19999' }]
        beforeEach(function() {
            insight.requestGet = sinon.stub();
            insight.requestGet.onFirstCall().callsArgWith(1, null, {
                statusCode: 200
            }, JSON.stringify(data));
        });
        it('makes the mnlist request as expected', function(cb) {
            insight.mnlist(function(err, mnlistinfo) {
                mnlistinfo[0].should.eql(data[0]);
                cb();
            });
        });
    });

  describe('requestPost', function() {
    var insight = new Insight();
    insight.request = sinon.stub();
    insight.request.onFirstCall().callsArgWith(1);
    it('works', function(cb) {
      insight.requestPost('some/path', {}, cb);
    });
  });

  describe('get information about an address', function() {
    var insight = new Insight();
    var data = require('./models/sampleAddressFromInsight.json');
    beforeEach(function() {
      insight.requestGet = sinon.stub();
      insight.requestGet.onFirstCall().callsArgWith(1, null, {
        statusCode: 200
      }, JSON.stringify(data));
    });
    it('makes the request as expected', function(cb) {
      insight.address('XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK', function(err, addressInfo) {
        (addressInfo instanceof AddressInfo).should.equal(true);
        cb();
      });
    });
    it('calls with error on parse error', function(cb) {
      insight.requestGet.onFirstCall().callsArgWith(1, null, {
        statusCode: 200
      }, 'malformed json');
      insight.address('XwJKGFYQS1B96rfWnPcVd9NKumsDv3JEiK', function(err) {
        should.exist(err);
        err.toString().should.contain('SyntaxError');
        cb();
      });
    });
  });
});

var rawTx = '01000000015884e5db9de218238671572340b207ee85b628074e7e467096c267266baf77a4000000006a473044022013fa3089327b50263029265572ae1b022a91d10ac80eb4f32f291c914533670b02200d8a5ed5f62634a7e1a0dc9188a3cc460a986267ae4d58faf50c79105431327501210223078d2942df62c45621d209fab84ea9a7a23346201b7727b9b45a29c4e76f5effffffff0150690f00000000001976a9147821c0a3768aa9d1a37e16cf76002aef5373f1a888ac00000000';
