let chai = require('chai');
let assert = chai.assert;
let request = require('./requestSimulator.js');
let th = require('./testHelper.js');
let app = require('../app.js');

const getSessionId = function(res){
  return res['headers']['Set-Cookie'].split("=")[1];
}
describe('app',()=>{
  describe('GET /bad',()=>{
    it('responds with 404',done=>{
      request(app,{method:'GET',url:'/bad'},(res)=>{
        assert.equal(res.statusCode,404);
        done();
      })
    })
  })
  describe('GET /',()=>{
    it('redirects to login.html',done=>{
      request(app,{method:'GET',url:'/'},(res)=>{
        th.should_be_redirected_to(res,'/login');
        assert.equal(res.body,"");
        done();
      })
    })
  })
  describe('POST /login',()=>{
    it('redirects to home for valid user',done=>{
      request(app,{method:'POST',url:'/login',body:'name=Aditi&password=1'},res=>{
        th.should_be_redirected_to(res,'/home');
        th.should_not_have_cookie(res,'message');
        done();
      })
    })
    it('redirects to login for invalid user',done=>{
      request(app,{method:'POST',url:'/login',body:'name=badUser&password=1'},res=>{
        th.should_be_redirected_to(res,'/login');
        done();
      })
    })
  })
  describe('GET /login.html',()=>{
    it('it should show the login page',done=>{
      request(app,{method:'GET',url:'/login'},(res)=>{
        th.status_is_ok(res);
        th.body_contains(res,'Login Here');
        done();
      })
    })
  })
  describe('GET /home.html',()=>{
    it('if not logged in, should redirect to login page',done=>{
      request(app,{method:'GET',url:'/home'},(res)=>{
        th.should_be_redirected_to(res,'/login');
        done();
      })
    })
  })
  describe('POST /logout',()=>{
    it('redirects to login page',done=>{
      request(app,{method:'POST',url:'/login',body:'name=Aditi&password=1'},res=>{
        let sessionid=getSessionId(res);
        request(app,{method:'POST',url:'/logout',headers: {cookie:`sessionid=${sessionid}`}},res=>{
          th.should_be_redirected_to(res,'/login');
          th.should_not_have_cookie(res,'message');
        })
      done();
      })
    })
  })
})
