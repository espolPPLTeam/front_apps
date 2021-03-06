import { VerificarCodigo, Responder } from '@/api'
import _ from 'lodash'

const realtimeModule = {
  namespaced: true,
  state: {
    leccion: {},
    estudiante: {
      ingresoCodigo: false
    },
    leccionEstado: {
      empezoTiempo: false,
      empezo: false
    },
    codigo: '',
    tiempo: '',
    estado: 'paralelo-no-esta-dando-leccion'
  },
  actions: {
    Codigo ({commit, dispatch}, { paraleloId, correo, codigo }) {
      return new Promise((resolve, reject) => {
        VerificarCodigo({ paraleloId, correo, codigo }).then((resp) => {
          commit('SET_ESTADO', resp.mensaje)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    ResponderPregunta ({commit}, datos) {
      let respuesta = {
        estudiante: datos.estudianteId,
        leccion: datos.leccionId,
        paralelo: datos.paraleloId,
        grupo: datos.grupoId,
        pregunta: datos.preguntaId,
        imagenes: datos.imagen,
        respuesta: datos.respuesta,
        contestado: true,
        arraySubrespuestas: `[]`
      }
      return new Promise((resolve, reject) => {
        Responder(respuesta)
          .then((response) => { // no se analizar el body, porque solo me manda el estado true de creado
            commit('SET_RESPUESTA', { preguntaId: respuesta.pregunta, imagen: respuesta.imagenes, respuesta: respuesta.respuesta, local: datos.local })
            resolve(true)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  },
  mutations: {
    SET_ESTADO_ESTUDIANTE (state, payload) {
      state.estudiante.ingresoCodigo = payload.codigoIngresado
    },
    SET_LECCION_ESTADO (state, payload) {
      state.leccionEstado.empezoTiempo = payload.leccionYaComenzo
      state.leccionEstado.empezo = payload.dandoLeccion
    },
    SET_ESTADOS (state, payload) {
      // deber recibir el codigo correcto
      state.estudiante.ingresoCodigo = payload.codigoLeccion
      state.leccionEstado.empezoTiempo = payload.leccionYaComenzo
      state.leccionEstado.empezo = payload.paraleloDandoLeccion
    },
    SET_TIEMPO (state, payload) {
      state.tiempo = payload
    },
    SET_ESTADO (state, payload) {
      state.estado = payload
      // ingresoCodigo  empezo empezoTiempo
      // 0 0 0 = el paralelo no esta dando leccion
      // 0 1 0 = tiene que ingresar el codigo
      // 1 1 0 = tiene que esperar a que empiece la leccion
      // 0 1 1 = al ingresar el codigo redirigirlo directamente
      // 1 1 1 = redirigirlo directamente
      // let empezoTiempo = state.leccionEstado.empezoTiempo
      // let empezo = state.leccionEstado.empezo
      // let ingresoCodigo = state.estudiante.ingresoCodigo
      // if (!empezo) {
      //   state.estado = 'paralelo-no-esta-dando-leccion'
      // } else if (empezo && empezoTiempo && ingresoCodigo) {
      //   state.estado = 'redirigirlo-directamente'
      // } else if (ingresoCodigo && empezo) {
      //   state.estado = 'tiene-que-esperar-a-que-empiece-la-leccion'
      // } else if (empezo && empezoTiempo) {
      //   state.estado = 'al-ingresar-el-codigo-redirigirlo-directamente'
      // } else if (empezo) {
      //   state.estado = 'tiene-que-ingresar-el-codigo'
      // }
    },
    SET_LECCION (state, payload) {
      // TODO: debe editarse para coger las preguntas con seccion
      try {
        state.leccion.id = payload._id
        state.leccion.nombre = payload.nombre
        state.leccion.estado = payload.estado
        let preguntasOrdenadas = _.sortBy(payload.preguntas, (o) => {
          return o.ordenP
        })
        let respuestas = payload.respuestas ? payload.respuestas : []
        let preguntasLimpiada = []
        for (let pregunta of preguntasOrdenadas) {
          let preguntaTemp = pregunta.pregunta
          if (!pregunta['esSeccion']) {
            let respuestaDePregunta = respuestas.find((resp) => {
              return resp.pregunta === preguntaTemp['_id']
            })
            if (respuestaDePregunta) {
              respuestaDePregunta = {
                contestado: respuestaDePregunta['contestado'],
                imagen: respuestaDePregunta['imagenes'],
                fechaContestado: respuestaDePregunta['createdAt'],
                respuesta: respuestaDePregunta['respuesta']
              }
            }
            preguntasLimpiada.push({
              id: preguntaTemp['_id'],
              descripcion: preguntaTemp['descripcion'],
              nombre: preguntaTemp['nombre'],
              puntaje: preguntaTemp['puntaje'],
              subiendo: false,
              respuesta: respuestaDePregunta,
              // eslint-disable-next-line
              respondido: respuestaDePregunta ? true : false,
              tiempoEstimado: preguntaTemp['tiempoEstimado']
            })
          }
        }
        state.leccion.preguntas = preguntasLimpiada
      } catch (err) {
        state.leccion = {}
        console.log(new Error('No se esta dando leccion'))
      }
    },
    SET_SUBIENDO_IMAGEN (state, preguntaId) {
      let index = state.leccion.preguntas.findIndex((obj) => obj.id === preguntaId)
      state.leccion.preguntas[index].subiendo = true
    },
    SET_TERMINO_SUBIR_IMAGEN (state, preguntaId) {
      let index = state.leccion.preguntas.findIndex((obj) => obj.id === preguntaId)
      state.leccion.preguntas[index].subiendo = false
    },
    SET_RESPUESTA (state, { preguntaId, imagen, respuesta, local }) {
      let resp = { preguntaId, imagen, respuesta, local }
      let index = state.leccion.preguntas.findIndex((obj) => obj.id === preguntaId)
      state.leccion.preguntas[index].respuesta = resp
    }
  },
  getters: {
    estado (store) {
      return store.estado
    },
    leccion (store) {
      return store.leccion
    },
    tiempo (store) {
      return store.tiempo
    }
  }
}

export default realtimeModule
