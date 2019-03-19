'use strict';
/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const pkg = require('../package.json');
const { expect } = require('chai');
const metHal = require('../index');

describe(`${pkg.name}/index.js`, function () {
  describe('query()', function () {
    it('should return a valid response', function (done) {
      metHal.query('*', (error, result) => {
        if (error) return done(error);

        expect(result).to.be.an('object');
        expect(result).to.have.property('response').that.is.an('object');
        expect(result.response).to.have.property('numFound').that.is.a('number');
        expect(result.response).to.have.property('start').that.is.a('number');
        expect(result.response).to.have.property('docs').that.is.an('array');
        done();
      });
    });
  });

  describe('find()', function () {
    it('should return multiple docs', function (done) {
      metHal.find('*', (error, docs) => {
        if (error) return done(error);

        expect(docs).to.be.an('array');
        docs.map(doc => {
          expect(doc).to.be.an('object');
          expect(doc).to.have.property('docid');
          expect(doc).to.have.property('label_s');
          expect(doc).to.have.property('uri_s');
        });
        done();
      });
    });

    it('should return multiple docs whose title contains beryllium', function (done) {
      metHal.find({
        title_t: 'beryllium'
      }, (error, docs) => {
        if (error) return done(error);

        expect(docs).to.be.an('array');
        docs.map(doc => {
          expect(doc).to.be.an('object');
          expect(doc).to.have.property('docid');
          expect(doc).to.have.property('label_s');
          expect(doc).to.have.property('uri_s');
        });
        done();
      });
    });
  });

  describe('findOne()', function () {
    it('should return just one doc', function (done) {
      metHal.findOne('*', (error, doc) => {
        if (error) return done(error);

        expect(doc).to.be.an('object');
        expect(doc).to.have.property('docid');
        expect(doc).to.have.property('label_s');
        expect(doc).to.have.property('uri_s');
        done();
      });
    });
  });

  describe('Stream()', function () {
    this.timeout(0);
    it('should return a valid response', function (done) {
      const stream = new metHal.Stream({
        q: '*',
        fq: 'submittedDate_tdate:[NOW-5DAYS/DAY TO NOW/HOUR]'
      });

      stream.on('error', done);
      stream.on('data', doc => {
        expect(doc).to.be.an('object');
        expect(doc).to.have.property('docid');
        expect(doc).to.have.property('label_s');
        expect(doc).to.have.property('uri_s');
      });
      stream.on('end', done);
    });
  });
});
