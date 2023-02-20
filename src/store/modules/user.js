import storage from 'store'
import { login, getInfo, logout } from '@/api/login'
import {ACCESS_TOKEN, PERMISSIONS, USER} from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          console.info('login resp:',response);
          storage.set(ACCESS_TOKEN, response.data.access_token, 24 * 60 * 60 * 1000)
          storage.set(PERMISSIONS, response.data.permissions, 24 * 60 * 60 * 1000)
          storage.set(USER, response.data, 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', response.data.access_token)
          console.info('resolve');
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const result = response;
          console.info('getInfo resp:',response);
          var name=null;
          if (response.data.role) {
            var role = response.data.role;
            role.permissions = response.data.permissions;
            // role.permissions.map(per => {
            //   if (per.actionEntitySet != null && per.actionEntitySet.length > 0) {
            //     const action = per.actionEntitySet.map(action => { return action.action })
            //     per.actionList = action
            //   }
            // })
            name = response.data.name;
            commit('SET_ROLES', role);
            commit('SET_INFO', result);
            console.info('SET_ROLES:',JSON.stringify(role));
          } else {
            reject(new Error('getInfo: roles must be a non-null array !'))
          }
          commit('SET_NAME', { name: name, welcome: welcome() })
          //TODO avatar
          commit('SET_AVATAR', "")

          console.info('GetInfo RESOLVE');
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        console.info('Logout');
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        storage.remove(ACCESS_TOKEN)
        resolve()
        // logout(state.token).then(() => {
        //   commit('SET_TOKEN', '')
        //   commit('SET_ROLES', [])
        //   storage.remove(ACCESS_TOKEN)
        //   resolve()
        // }).catch(() => {
        //   resolve()
        // }).finally(() => {
        // })
      })
    }

  }
}

export default user
