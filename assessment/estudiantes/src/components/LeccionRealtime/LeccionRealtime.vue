<template>
  <div id="leccion">
    <h1>sad</h1>
<!--     <app-nav :pregunta="preguntaActualNombre" :tiempo="tiempo" :leccionNombre="leccionNombre" :cantidadPreguntas="cantidadPreguntas"
        v-on:pregunta="pestana($event)" :preguntaActualParent="activo" :preguntas="preguntas"
    ></app-nav>
    <v-container fluid style="min-height: 0;" grid-list-lg>
      <v-tabs :hide-slider="true" v-model="active"  fixed-tabs  v-touch="{
          left: () => next(),
          right: () => prev()
        }">
        <v-flex xs2 ms2 class="text-xs-left">
          <v-btn icon @click.native="prev" :disabled="botonIzquierdoBloqueado">
            <v-icon color="grey darken-2" >mdi-chevron-left</v-icon>
          </v-btn>
        </v-flex>
        <v-flex xs8 ms8 fill-height grid-list-xs class="text-xs-center">
          <h3>{{ preguntaActualNombre }}</h3>
          <h4 color="blue" v-if="!preguntaActualRespondida"> <v-icon color="blue" >mdi-circle</v-icon> no contestado</h4>
          <h4 class="grey--text" v-if="preguntaActualRespondida"> respondido </h4>
        </v-flex>
        <v-flex xs2 ms2 class="text-xs-right">
          <v-btn icon @click.native="next" :disabled="botonDerechoBloqueado">
            <v-icon color="grey darken-2" >mdi-chevron-right</v-icon>
          </v-btn>
        </v-flex>
        <v-tab v-for="(pregunta, index) in leccion.preguntas" :key="index" v-show="false">
          A
        </v-tab>
        <v-tab-item v-for="(pregunta, index) in leccion.preguntas" :key="index" >
          <v-card  class="text-xs-center">
            <v-card-text primary-title  class="text-xs-center">
              <h3>{{ pregunta.nombre }}</h3>
            </v-card-text>
              <span v-html="pregunta.descripcion"></span>
            <v-card-actions>
              <span class="grey--text">Tiempo Estimado: {{ pregunta.tiempoEstimado }} minutos</span>
            </v-card-actions>
          </v-card>
          <v-card>
            <v-card-media height="100px"  v-if="valido(pregunta.respuesta)" >
              <img :src="pregunta.respuesta.imagen" :id="`imagen_${pregunta.id}`">
            </v-card-media>
            <div v-if="!valido(pregunta.respuesta)">
              <input type="file" class="filepond imagen" name="imagenes" :id="pregunta.id">
            </div>
            <v-card-title primary-title v-if="pregunta.respuesta" >
              <v-text-field
                name="input-4-1"
                label="Su Respuesta"
                multi-line
                :value="pregunta.respuesta.respuesta"
                disabled
              ></v-text-field>
            </v-card-title>
            <v-card-title primary-title v-if="!pregunta.respuesta">
              <v-text-field
                name="input-4-1"
                label="Su Respuesta"
                multi-line
                :id="`respuesta_${pregunta.id}`"
              ></v-text-field>
            </v-card-title>
            <v-btn class="hidden-md-and-up" block color="primary" large :disabled="pregunta.respuesta !== undefined || pregunta.subiendo" @click.native="responder(pregunta.id)">
              Responder
            </v-btn>
            <v-btn class="hidden-sm-and-down" large color="primary" :disabled="pregunta.respuesta !== undefined || pregunta.subiendo" @click.native="responder(pregunta.id)">
              Responder
            </v-btn>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-container>

    <v-snackbar
        :timeout="4000"
        :multi-line="true"
        :color="'error'"
        :top="true"
        v-model="snackbar"
      >
        Error al enviar imagen en {{preguntaActualNombre}}, por favor reintente
        <v-btn flat color="white" @click.native="snackbar = false">Cerrar</v-btn>
    </v-snackbar>
    <v-snackbar
        :timeout="4000"
        :multi-line="true"
        :color="'error'"
        :top="true"
        v-model="snackbarErrorResponder"
      >
        Error al responder en {{preguntaActualNombre}}, por favor reintente
        <v-btn flat color="white" @click.native="snackbarErrorResponder = false">Cerrar</v-btn>
    </v-snackbar>
    <v-snackbar
        :timeout="4000"
        :multi-line="true"
        :color="'success'"
        :top="true"
        v-model="snackbarResponder"
      >
        Respuesta de {{preguntaActualNombre}} enviada
        <v-btn flat color="white" @click.native="snackbarResponder = false">Cerrar</v-btn>
    </v-snackbar> -->
  </div>
</template>

<script>
import Viewer from 'viewerjs'
import * as FilePondO from 'filepond'
import _ from 'lodash'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImageResize from 'filepond-plugin-image-resize'
import FilePondPluginImageTransform from 'filepond-plugin-image-transform'
import FilePondPluginImageCrop from 'filepond-plugin-image-crop'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilepondPluginImagePreview from 'filepond-plugin-image-preview'
// // import store from '@/store'

import AppNav from './Nav'

import 'filepond/dist/filepond.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

export default {
  components: { AppNav },
  computed: {
    io () {
      return this.$store.getters.io
    },
    leccion () {
      return this.$store.getters['realtime/leccion']
    },
    preguntas () {
      return this.$store.getters['realtime/leccion'].preguntas
    },
    leccionNombre () {
      return this.$store.getters['realtime/leccion'].nombre
    },
    cantidadPreguntas () {
      return this.$store.getters['realtime/leccion'].preguntas.length
    },
    socket () {
      return this.io
    },
    sidenav () {
      return this.side
    },
    activo () {
      return this.active
    },
    tiempo () {
      return this.$store.getters['realtime/tiempo']
    },
    preguntaActualRespondida () {
      let leccion = this.$store.getters['realtime/leccion']
      if (leccion.preguntas[this.preguntaActual] && leccion.preguntas[this.preguntaActual].respuesta) {
        return true
      } else {
        return false
      }
    }
  },
  data () {
    return {
      active: null,
      preguntaActualNombre: 'Pregunta 1',
      preguntaActual: 0,
      botonDerechoBloqueado: false,
      botonIzquierdoBloqueado: true,
      botonEnviarBloqueado: -1,
      botonesBloqueados: [],
      myFile: null,
      snackbar: false,
      snackbarResponder: false,
      side: false,
      snackbarErrorResponder: false,
      respuestas: [],
      ponds: {}
    }
  },
  beforeRouteEnter (to, from, next) {
    next()
  },
  mounted () {
    // setear tamano de las imagenes
    for (let elemento of document.querySelectorAll('img')) {
      elemento.style.width = `${(1100 * screen.width) / 1280}px`
      /* eslint-disable no-new */
      new Viewer(elemento, { toolbar: { zoomIn: 1, zoomOut: 1, rotateLeft: 1, rotateRight: 1 }, title: false, navbar: false })
    }

    // plugin para enviar imagenes
    FilePondO.registerPlugin(FilePondPluginFileValidateType, FilePondPluginImageExifOrientation, FilePondPluginImageResize, FilePondPluginImageTransform, FilePondPluginImageCrop, FilepondPluginImagePreview)
    FilePondO.setOptions({
      server: {
        url: './api/respuestas/imagen',
        timeout: 7000
      }
    })

    // boton enviar imagenes
    let ponds = []
    for (let pond of document.querySelectorAll('.imagen')) {
      let pondTmp = FilePondO.create(pond, {
        labelIdle: `Subir imagen... <span class="filepond--label-action">Buscar</span>`,
        imagePreviewHeight: 170,
        imageCropAspectRatio: '1:1',
        imageResizeTargetWidth: 300,
        imageResizeTargetHeight: 300,
        imageTransformOutputQuality: 30,
        labelFileLoading: 'Comprimiendo',
        labelFileProcessing: 'Subiendo',
        labelFileProcessingComplete: 'Completada',
        labelTapToCancel: 'Toque para cancelar',
        labelTapToUndo: 'Toque para eliminar',
        acceptedFileTypes: ['image/*']
      })
      ponds.push(pondTmp)
    }

    // acciones y loaders de enviar imagenes
    for (let pond of document.querySelectorAll('.imagen')) {
      pond.addEventListener('FilePond:addfilestart', (e) => {
        this.$store.commit('realtime/SET_SUBIENDO_IMAGEN', e.srcElement.id)
      })
      pond.addEventListener('FilePond:processfile', (e) => {
        this.ponds[e.detail.file.id] = { preguntaId: e.srcElement.id }
        this.$store.commit('realtime/SET_TERMINO_SUBIR_IMAGEN', e.srcElement.id)
      })
      pond.addEventListener('FilePond:removefile', (e) => {
        delete this.ponds[e.detail.file.id]
      })
    }

    for (let pond of ponds) {
      pond.on('processfile', (error, file) => {
        if (error) {
          this.snackbar = true
          return
        }
        this.ponds[file.id]['server'] = file.serverId
        let URL = window.URL
        var url = URL.createObjectURL(file.file)
        this.ponds[file.id]['local'] = url
      })
    }
  },
  methods: {
    valido (objeto) {
      if (!objeto) {
        return false
      }
      return !_.isEmpty(objeto)
    },
    next () {
      const active = parseInt(this.active)
      if (parseInt(active + 2) === this.cantidadPreguntas) {
        this.botonDerechoBloqueado = true
        this.botonIzquierdoBloqueado = false
        this.preguntaActualNombre = `Pregunta ${parseInt(this.active) + 2}`
        this.active = (active + 1).toString()
      } else if (parseInt(active + 2) < this.cantidadPreguntas) {
        this.botonIzquierdoBloqueado = false
        this.preguntaActualNombre = `Pregunta ${parseInt(this.active) + 2}`
        this.active = (active + 1).toString()
      }
      this.preguntaActual = parseInt(this.active)
    },
    prev () {
      const active = parseInt(this.active)
      if (active === 1) {
        this.botonDerechoBloqueado = false
        this.botonIzquierdoBloqueado = true
        this.preguntaActualNombre = `Pregunta ${parseInt(this.active)}`
        this.active = (active - 1).toString()
      } else if (active > 1) {
        this.preguntaActualNombre = `Pregunta ${parseInt(this.active)}`
        this.active = (active - 1).toString()
        this.botonDerechoBloqueado = false
      }
      this.preguntaActual = parseInt(this.active)
    },
    pestana (numero) {
      this.preguntaActualNombre = `Pregunta ${parseInt(numero) + 1}`
      if (numero === 0) {
        this.botonDerechoBloqueado = false
        this.botonIzquierdoBloqueado = true
      } else if ((numero + 1) === this.cantidadPreguntas) {
        this.botonDerechoBloqueado = true
        this.botonIzquierdoBloqueado = false
      } else {
        this.botonDerechoBloqueado = false
        this.botonIzquierdoBloqueado = false
      }
      this.active = numero.toString()
      this.preguntaActual = parseInt(this.active)
    },
    responder (preguntaId) {
      let imagen = ''
      let local = ''
      for (let id in this.ponds) {
        if (this.ponds[id]['preguntaId'] === preguntaId) {
          imagen = JSON.parse(this.ponds[id]['server'])['datos']
          local = this.ponds[id]['local']
        }
      }
      let respuesta = this.$el.querySelector(`#respuesta_${preguntaId}`).value
      let estudianteId = this.$store.getters['estudiante/id']
      let paraleloId = this.$store.getters['estudiante/paralelo']
      let grupoId = this.$store.getters['estudiante/grupo']
      let leccionId = this.$store.getters['realtime/leccion']['id']
      this.$store.dispatch('realtime/ResponderPregunta', { imagen, respuesta, preguntaId, local, estudianteId, paraleloId, grupoId, leccionId })
        .then(() => {
          this.snackbarResponder = true
        })
        .catch(() => {
          this.snackbarErrorResponder = true
        })
    }
  }
}
</script>

<style scoped>
</style>
