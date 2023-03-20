<template>
  <div class="column q-gutter-md">
    <q-select
      outlined
      v-model="selected_src"
      :options="src_options"
      label="Select source"
      @input="emit_empty"
    >
      <template v-slot:option="scope">
        <!-- <q-item v-bind="scope.itemProps" v-on="scope.itemEvents"> -->
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label v-html="scope.opt.label"></q-item-label>
            <q-item-label caption v-html="scope.opt.sublabel"></q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:prepend>
        <q-icon name="mdi-source-repository" />
      </template>
    </q-select>

    <transition
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
      mode="out-in"
    >
      <div v-if="selected_src.value == 'remote'" key="remote" class="row items-center">
        <q-input label="wasm url" outlined v-model="wasm_url" class="q-mr-md q-mb-md">
          <template v-slot:prepend>
            <q-icon name="mdi-file-link" />
          </template>
        </q-input>
        <q-input label="abi url" outlined v-model="abi_url" class="q-mr-md q-mb-md">
          <template v-slot:prepend>
            <q-icon name="mdi-file-link" />
          </template>
        </q-input>
        <div class="q-mr-md">
          <q-btn class="q-mr-sm q-mb-sm" label="use The DAOScape core" color="primary" outline @click="load_core" />
          <q-btn class="q-mr-sm q-mb-sm" label="load" color="primary" @click="load_remote" />
        </div>
        <div class="q-mt-lg">
          <p class="text-left">The most recent version of The DAOScape Core contract <a target="_blank" title="The DAOScape Core contract" href="https://github.com/FreeosDAO/daclifycore">can be found here.</a></p>
          <p class="text-left"><em><b>Please note:</b> Loading from github requres the url to start with "https://raw.githubusercontent.com/".</em></p>
        </div>
      </div>

      <div v-else-if="selected_src.value == 'local'" key="local" class="row items-center">
        <div style="width: 230px" class="q-mr-md">
          <q-file
            outlined
            clearable
            counter
            v-model="wasm_file"
            label="wasm file"
            accept=".wasm"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-file-code" />
            </template>
          </q-file>
        </div>
        <div style="width: 230px" class="q-mr-md">
          <q-file
            outlined
            clearable
            counter
            v-model="abi_file"
            label="abi file"
            accept=".abi"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-file-code" />
            </template>
          </q-file>
        </div>
        <div class="q-mr-md">
          <q-btn label="load" color="primary" @click="compile_local" />
        </div>
      </div>

      <div
        v-else-if="selected_src.value == 'daclify'"
        key="daclify"
        class="row items-center no-wrap"
      >
        <q-select
          class="q-mr-md"
          style="width: 100%"
          outlined
          v-model="daclify_registry_selection"
          :options="daclify_registry_options"
          label="Select version"
        >
          <template v-slot:option="scope">
            <!-- <q-item v-bind="scope.itemProps" v-on="scope.itemEvents"> -->
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label v-html="scope.opt.label"></q-item-label>
                <q-item-label caption v-html="scope.opt.sublabel"></q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:prepend>
            <q-icon name="mdi-expand-all" />
          </template>
        </q-select>
        <div class="q-mr-md">
          <q-btn label="load" color="primary" @click="" />
        </div>
      </div>
    </transition>
    <wasmCompiler ref="wasm_compiler" />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import wasmCompiler from "../wasm-compiler";

export default defineComponent({
  name: "codeSelector",
  components:{
    wasmCompiler
  },
  emits: ['newhex'],
  data() {
    return {
      selected_src: { label: "Remote", sublabel: "github, server, ... ", value: "remote" },
      src_options: [
        /*{
          label: "Daclify",
          sublabel: "official releases from Daclify registry",
          value: "daclify",
        },*/
        { label: "Remote", sublabel: "github, server, ... ", value: "remote" },
        //{ label: "Local", sublabel: "disk", value: "local" },
      ],
      wasm_url: "",
      abi_url: "",

      wasm_file: [],
      abi_file: [],

      daclify_registry_selection: "",
      daclify_registry_options: [
        { label: "Todo", sublabel: "fetch code versions from register", value: "todo" },
      ],
    };
  },
  methods: {
    emit_empty() {
      this.$emit("newhex", { code_hash: "", abi_hash: "", wasm: "", abi: "" });
    },
    load_core(){
      this.wasm_url = "https://raw.githubusercontent.com/FreeosDAO/daclifycore/master/daclifycore.wasm"
      this.abi_url = "https://raw.githubusercontent.com/FreeosDAO/daclifycore/master/daclifycore.abi"
      this.load_remote()
    },
    async load_remote() {
      let wasm = await this.$refs.wasm_compiler.loadRemoteWasm(this.wasm_url);
      let abi = await this.$refs.wasm_compiler.loadRemoteAbi(this.abi_url);
      let res = {
        wasm: wasm.wasm,
        code_hash: wasm.code_hash,
        abi: abi.abi,
        abi_hash: abi.abi_hash,//sha256(new Uint8Array(abi, 0)),
      }; 
      
      this.$emit("newhex", res);
    },
    async compile_local() {
      let wasm = await this.$refs._readLocalFile(this.wasm_file, true);
      let abi = await this.$refs._readLocalFile(this.abi_file, false);

      wasm = this.$refs.wasm_compiler.buf2hex(wasm)
      abi = await this.$refs.wasm_compiler.parseAbi(abi)
      
      let res = {
        wasm: wasm,
        code_hash: this.$refs.wasm_compiler.sha256(wasm),//sha256(new Uint8Array(wasm, 0)),
        abi: abi,
        abi_hash: this.$refs.wasm_compiler.sha256(abi),//sha256(new Uint8Array(abi, 0)),
      };
      this.$emit("newhex", res);
      //this.emitter.emit("new_hex", res)
    },

    /*async loadRemoteWasm(url) {
      url = url + "?t=" + new Date().getTime();
      let res = await this.$axios.get(url, {
        responseType: "arraybuffer",
      });

      let code_hash = sha256(new Uint8Array(res.data, 0));
      console.log("calculated code_hash", code_hash);
      res = {
        wasm: this.buf2hex(res.data),
        code_hash: code_hash,
      };
      return res;
    },
    async loadRemoteAbi(url) {
      url = url + "?t=" + new Date().getTime();
      let res = await this.$axios.get(url, {
        responseType: "text",
        transformResponse: [(data) => data],
      });
      let abi_hash = sha256(new Uint8Array(res.data, 0));
      console.log("calculated abi_hash", abi_hash);
      res = {
        abi: await this.parseAbi(res.data),
        abi_hash: abi_hash,
      };

      return res;
    },

    async _readLocalFile(file, asbuffer = false) {
      return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = function (e) {
          return resolve(e.target.result);
        };
        if (asbuffer) {
          // for wasm
          fr.readAsArrayBuffer(file);
        } else {
          // for abi
          fr.readAsText(file, `utf8`);
        }
      });
    },

    async parseAbi(abifile) {
      const Serialize = this.$eos.Serialize;
      const buffer = new Serialize.SerialBuffer({
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder(),
      });
      let abi = JSON.parse(abifile);
      const abiDefinition = await this.$eos.api.abiTypes.get(`abi_def`);
      abi = abiDefinition.fields.reduce(
        (acc, { name: fieldName }) =>
          Object.assign(acc, { [fieldName]: acc[fieldName] || [] }),
        abi
      );
      abiDefinition.serialize(buffer, abi);
      return Buffer.from(buffer.asUint8Array()).toString(`hex`);
    },
    buf2hex(buffer) {
      return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
    },*/
  },
});
</script>
