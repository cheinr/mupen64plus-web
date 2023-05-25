# build native or web version of mupen64-plus
# to build web version: 'make web'
# to build native version: 'make native'
# to run web version: 'make run-web'
# to run native version: 'make run-native'


GIT_COMMIT = $(shell git rev-parse --short=10 HEAD)
INI_TO_JSON = $(abspath ./utils/iniToJson.js)

GAMES_DIR ?= ./games
PLATFORM ?= web
BIN_DIR ?= $(abspath ./bin/$(PLATFORM))
SCRIPTS_DIR := ./scripts

POSTFIX ?= -web
SO_EXTENSION ?= .so

UI ?= mupen64plus-ui-console-web-netplay
UI_DIR = $(UI)/projects/unix

CORE ?= mupen64plus-core-web-netplay
CORE_DIR = $(CORE)/projects/unix
CORE_LIB = $(CORE)$(POSTFIX)$(SO_EXTENSION)
CORE_LIB_STATIC = $(CORE_DIR)/libmupen64plus-web.a
CORE_LIB_JS = $(CORE)$(POSTFIX).wasm


LIBSRC_DIR = deps/libsamplerate
AUDIO ?= mupen64plus-audio-sdl
AUDIO_DIR = $(AUDIO)/projects/unix/
AUDIO_LIB = $(AUDIO).so
AUDIO_LIB_JS = $(AUDIO)-web.wasm
AUDIO_LIB_STATIC = $(AUDIO_DIR)$(AUDIO)-web.a


NATIVE_AUDIO := mupen64plus-audio-sdl
NATIVE_AUDIO_DIR = $(NATIVE_AUDIO)/projects/unix
NATIVE_AUDIO_LIB = $(NATIVE_AUDIO).so

VIDEO ?= mupen64plus-video-glide64mk2
VIDEO_DIR = $(VIDEO)/projects/unix
VIDEO_LIB_JS = $(VIDEO)$(POSTFIX).wasm
VIDEO_LIB = $(VIDEO)$(POSTFIX)$(SO_EXTENSION)
VIDEO_LIB_STATIC = $(VIDEO_DIR)/$(VIDEO)-web.a

RICE = mupen64plus-video-rice-web-netplay
RICE_VIDEO_LIB = $(RICE)-web$(POSTFIX)$(SO_EXTENSION)
RICE_VIDEO_LIB_JS = $(RICE)$(POSTFIX).wasm
RICE_VIDEO_DIR = $(RICE)/projects/unix/
RICE_VIDEO_LIB_STATIC = $(RICE_VIDEO_DIR)$(RICE)-web.a

INPUT ?= mupen64plus-input-sdl
INPUT_DIR = $(INPUT)/projects/unix
INPUT_LIB = $(INPUT)$(POSTFIX)$(SO_EXTENSION)
INPUT_LIB_JS = $(INPUT)$(POSTFIX).wasm
INPUT_LIB_STATIC = $(INPUT_DIR)/$(INPUT)$(POSTFIX).a

RSP ?= mupen64plus-rsp-hle
RSP_DIR = $(RSP)/projects/unix
RSP_LIB = $(RSP)$(POSTFIX)$(SO_EXTENSION)
RSP_LIB_JS = $(RSP)$(POSTFIX).wasm
RSP_LIB_STATIC = $(RSP_DIR)/$(RSP)$(POSTFIX).a

TARGET ?= mupen64plus
PLUGINS_DIR = $(BIN_DIR)/plugins
TARGET_LIB = $(TARGET)$(POSTFIX)$(SO_EXTENSION)
TARGET_JS ?= index.$(GIT_COMMIT).js
TARGET_WORKER_JS ?= index.$(GIT_COMMIT).worker.js
INDEX_TEMPLATE = $(abspath $(SCRIPTS_DIR)/index.template.html)
PRE_JS = $(abspath $(SCRIPTS_DIR)/prefix.js)
POST_JS = $(abspath $(SCRIPTS_DIR)/postfix.js)
MODULE_JS = module.js

UTILITY_FILES = \
	$(BIN_DIR)/mupen64plus.json \

INPUT_FILES = \
	$(BIN_DIR)/data/InputAutoCfg.ini \
	$(BIN_DIR)/data/RiceVideoLinux.ini \
	$(BIN_DIR)/stats.min.js \
	$(BIN_DIR)/main.js \
	$(BIN_DIR)/gamepad-utils.js \
	$(BIN_DIR)/idbfs-file-utils.js \
	$(INDEX_TEMPLATE) \
	$(BIN_DIR)/$(MODULE_JS) \
	$(BIN_DIR)/data/mupen64plus.cfg \
	$(BIN_DIR)/data/mupen64plus.ini \
	# $(BIN_DIR)/data/Glide64mk2.ini \

BENCHMARK_DEPS = \
	mupen64plus-web-benchmark/node_modules

OPT_LEVEL ?= -O2
DEBUG_LEVEL ?=

#MEMORY = 524288
#MEMORY =  402653184
#MEMORY =  655360000
MEMORY =   1310720000
#MEMORY = 268435456
#MEMORY = 134217728

NATIVE_BIN := bin
NATIVE_PLUGINS := \
		$(NATIVE_BIN)/libmupen64plus.so.2 \
		$(NATIVE_BIN)/mupen64plus-input-sdl.so \
		$(NATIVE_BIN)/mupen64plus-rsp-hle.so \
		$(NATIVE_BIN)/mupen64plus-video-rice-web-netplay.so \
		$(NATIVE_BIN)/mupen64plus-audio-sdl.so \

NATIVE_EXE := $(NATIVE_BIN)/mupen64plus
NATIVE_DEPS := $(NATIVE_PLUGINS) $(NATIVE_EXE)

WEB_DEPS := $(BIN_DIR)/$(TARGET_JS) $(UTILITY_FILES)

ALL_DEPS := $(WEB_DEPS) 
ifeq ($(PLATFORM), native)
		ALL_DEPS := $(NATIVE_DEPS)
endif

all: $(ALL_DEPS)
	node remove-table-max-size.js bin/web/index.$(GIT_COMMIT).wasm

run-benchmark: $(BENCHMARK_DEPS)
	cd mupen64plus-web-benchmark && npm run benchmark

.FORCE:

native: .FORCE
	$(MAKE) PLATFORM=native

web: .FORCE
	$(MAKE) PLATFORM=web

RICE_CFG_DIR := cfg/rice
GLIDE_CFG_DIR := cfg/glide
DATA_DIR := mupen64plus-core-web-data/data

CFG_DIR := $(RICE_CFG_DIR)

#ifdef glide
#	CFG_DIR := $(GLIDE_CFG_DIR)
#endif

NATIVE_ARGS ?=

run-native: native
	./$(NATIVE_EXE) \
			$(NATIVE_ARGS) \
			--corelib $(NATIVE_BIN)/libmupen64plus.so.2 \
			--configdir $(CFG_DIR) \
			--datadir $(CFG_DIR)


# use browser=chromium arg (or chrome etc) to test in broser
# e.g. 'make run-web browser=chromium'
BROWSER ?= firefox
ifeq ($(browser), chromium)
		BROWSER := $(shell which chromium-browser)
endif
EMRUN ?= #--emrun

run-web: web
	emrun $ --browser $(BROWSER) $(BIN_DIR)/index.html --nospeedlimit

run: run-web

clean-native:
	cd mupen64plus-ui-console-web-netplay/projects/unix && $(MAKE) clean
	cd $(CORE_DIR) && $(MAKE) clean
	cd $(INPUT_DIR) && $(MAKE) clean
	cd $(RSP_DIR) && $(MAKE) clean
	cd $(VIDEO_DIR) && $(MAKE) clean
	cd $(RICE_VIDEO_DIR) && $(MAKE) clean
	cd $(AUDIO_DIR) && $(MAKE) clean

clean: clean-web clean-native

rebuild: clean all

$(NATIVE_BIN):
	mkdir $(NATIVE_BIN)

$(NATIVE_EXE): $(NATIVE_BIN) mupen64plus-ui-console-web-netplay/projects/unix/mupen64plus
	cp mupen64plus-ui-console-web-netplay/projects/unix/mupen64plus $@

mupen64plus-ui-console-web-netplay/projects/unix/mupen64plus:
	cd mupen64plus-ui-console-web-netplay/projects/unix && $(MAKE) all

$(NATIVE_BIN)/libmupen64plus.so.2: $(NATIVE_BIN) $(CORE_DIR)/libmupen64plus.so.2.0.0
	cp $(CORE_DIR)/libmupen64plus.so.2.0.0 $@

$(CORE_DIR)/libmupen64plus.so.2.0.0:
	cd $(CORE_DIR) && $(MAKE) all

$(NATIVE_BIN)/mupen64plus-input-sdl.so: $(NATIVE_BIN) $(INPUT_DIR)/mupen64plus-input-sdl.so
	cp $(INPUT_DIR)/mupen64plus-input-sdl.so $@

$(INPUT_DIR)/mupen64plus-input-sdl.so:
	cd $(INPUT_DIR) && $(MAKE) all

$(RSP_DIR)/mupen64plus-rsp-hle.so:
	cd $(RSP_DIR) && $(MAKE) all

$(NATIVE_BIN)/mupen64plus-rsp-hle.so: $(NATIVE_BIN) $(RSP_DIR)/mupen64plus-rsp-hle.so
	cp $(RSP_DIR)/mupen64plus-rsp-hle.so $@

$(VIDEO_DIR)/mupen64plus-video-glide64mk2.so:
	cd $(VIDEO_DIR) && $(MAKE) all

$(NATIVE_BIN)/mupen64plus-video-glide64mk2.so: $(NATIVE_BIN) $(VIDEO_DIR)/mupen64plus-video-glide64mk2.so
	cp $(VIDEO_DIR)/mupen64plus-video-glide64mk2.so $@

$(RICE_VIDEO_DIR)/mupen64plus-video-rice-web-netplay.so:
	cd $(RICE_VIDEO_DIR) && $(MAKE) all

$(NATIVE_BIN)/mupen64plus-video-rice-web-netplay.so: $(NATIVE_BIN) $(RICE_VIDEO_DIR)/mupen64plus-video-rice-web-netplay.so
	cp $(RICE_VIDEO_DIR)/mupen64plus-video-rice-web-netplay.so $@

$(NATIVE_AUDIO_DIR)/mupen64plus-audio-sdl.so:
	cd $(NATIVE_AUDIO_DIR) && $(MAKE) all

$(NATIVE_BIN)/mupen64plus-audio-sdl.so: $(NATIVE_BIN) $(NATIVE_AUDIO_DIR)/mupen64plus-audio-sdl.so
	cp $(NATIVE_AUDIO_DIR)/mupen64plus-audio-sdl.so $@


ifeq ($(config), debug)

OPT_LEVEL = -O2 -g3 -s -s ASSERTIONS=1 -s STACK_OVERFLOW_CHECK=1 -s SAFE_HEAP=1 #-Oz -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -fsanitize=address -Wcast-align -Wover-aligned -s WARN_UNALIGNED=1 ASSERTIONS=0 -s NO_EXIT_RUNTIME=1 -s ALLOW_MEMORY_GROWTH -fsanitize=address 			-s INITIAL_MEMORY=$(MEMORY) #  	-s STACK_OVERFLOW_CHECK=2 -fsanitize=undefined
DEBUG_LEVEL = -g3

else ifeq ($(config), release)

OPT_LEVEL = -O3 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s NO_EXIT_RUNTIME -s ALLOW_MEMORY_GROWTH=1 -s VERBOSE=1

else ifeq ($(config), benchmark)

OPT_LEVEL = -O3 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s NO_EXIT_RUNTIME -s ALLOW_MEMORY_GROWTH=1  -sNO_DISABLE_EXCEPTION_CATCHING -DBENCHMARK_MODE=1 -s VERBOSE=1

else

OPT_LEVEL = -O3 -g3 -s NO_EXIT_RUNTIME -s ALLOW_MEMORY_GROWTH=1 -s VERBOSE=1

endif


OPT_FLAGS := $(OPT_LEVEL) \
			$(DEBUG_LEVEL) \
			-s 'EXTRA_EXPORTED_RUNTIME_METHODS=[\"ccall\", \"cwrap\", \"getValue\", \"FS\", \"setValue\", \"netplay_request_pause\", \"netplay_request_resume\"]' \
			-DEMSCRIPTEN=1 \
			-DUSE_FRAMESKIPPER=1


STATIC_LIBRARIES =
CORE_LD_LIB = 

ifeq ($(static-plugins), 0)
USE_DYNAMIC_PLUGINS = 1
USE_STATIC_PLUGINS = 0

REQUIRED_CORE_PLUGIN_FILES = $(PLUGINS_DIR)/$(CORE_LIB)
REQUIRED_AUDIO_PLUGIN_FILES = $(PLUGINS_DIR)/$(AUDIO_LIB)
REQUIRED_INPUT_PLUGIN_FILES = $(PLUGINS_DIR)/$(INPUT_LIB)
REQUIRED_VIDEO_PLUGIN_FILES = $(PLUGINS_DIR)/$(RICE_VIDEO_LIB)
REQUIRED_RSP_PLUGIN_FILES = $(PLUGINS_DIR)/$(RSP_LIB)

PLUGIN_BUILD_TARGET = all

else
USE_DYNAMIC_PLUGINS = 0
USE_STATIC_PLUGINS = 1

PLUGIN_BUILD_TARGET = static

CORE_LD_LIB = ../../../$(CORE_LIB_STATIC)
STATIC_LIBRARIES = ../../../$(AUDIO_LIB_STATIC) \
		../../../$(INPUT_LIB_STATIC) \
		../../../$(RSP_LIB_STATIC) \
		../../../$(CORE_LIB_STATIC) \
		../../../$(RICE_VIDEO_LIB_STATIC) \
		../../../$(LIBSRC_DIR)/build/src/libsamplerate.a

REQUIRED_CORE_PLUGIN_FILES = $(CORE_LIB_STATIC)
REQUIRED_AUDIO_PLUGIN_FILES = $(AUDIO_LIB_STATIC)
REQUIRED_INPUT_PLUGIN_FILES = $(INPUT_LIB_STATIC)
REQUIRED_VIDEO_PLUGIN_FILES = $(RICE_VIDEO_LIB_STATIC)
REQUIRED_RSP_PLUGIN_FILES = $(RSP_LIB_STATIC)

OPT_FLAGS += -DM64P_STATIC_PLUGINS=1
endif

REQUIRED_PLUGINS = $(REQUIRED_CORE_PLUGIN_FILES) \
	$(REQUIRED_AUDIO_PLUGIN_FILES) \
	$(REQUIRED_INPUT_PLUGIN_FILES) \
	$(REQUIRED_VIDEO_PLUGIN_FILES) \
	$(REQUIRED_RSP_PLUGIN_FILES)


$(PLUGINS_DIR)/%.so : %/projects/unix/%.wasm
	cp "$<" "$@"

# libmupen64plus.so.2 deviates from standard naming
$(PLUGINS_DIR)/$(CORE_LIB) : $(CORE_DIR)/$(CORE_LIB_JS)
	mkdir -p $(PLUGINS_DIR)
	cp "$<" "$@"

$(PLUGINS_DIR)/$(AUDIO_LIB) : $(AUDIO_DIR)/$(AUDIO_LIB_JS)
	mkdir -p $(PLUGINS_DIR)
	cp "$<" "$@"

$(PLUGINS_DIR)/$(VIDEO_LIB) : $(VIDEO_DIR)/$(VIDEO_LIB_JS)
	mkdir -p $(PLUGINS_DIR)
	cp "$<" "$@"

$(PLUGINS_DIR)/$(RICE_VIDEO_LIB) : $(RICE_VIDEO_DIR)/$(RICE_VIDEO_LIB_JS)
	mkdir -p $(PLUGINS_DIR)
	cp -f "$<" "$@"

$(PLUGINS_DIR)/$(INPUT_LIB) : $(INPUT_DIR)/$(INPUT_LIB_JS)
	mkdir -p $(PLUGINS_DIR)
	cp "$<" "$@"

$(PLUGINS_DIR)/$(RSP_LIB) : $(RSP_DIR)/$(RSP_LIB_JS)
	mkdir -p $(PLUGINS_DIR)
	cp "$<" "$@"

$(BIN_DIR) :
	#Creating output directory
	mkdir -p $(BIN_DIR)

$(BENCHMARK_DEPS):
	cd mupen64plus-web-benchmark && npm i

rice: $(RICE_VIDEO_DIR)/$(RICE_VIDEO_LIB_JS)

$(REQUIRED_VIDEO_PLUGIN_FILES): .FORCE
	cd $(RICE_VIDEO_DIR) && \
			emmake $(MAKE) \
			CROSS_COMPILE="" \
			POSTFIX=-web\
			UNAME=Linux \
			USE_FRAMESKIPPER=1 \
			EMSCRIPTEN=1 \
			M64P_STATIC_PLUGINS=$(USE_STATIC_PLUGINS) \
			SO_EXTENSION="wasm" \
			USE_GLES=1 \
			NO_ASM=1 \
			ZLIB_CFLAGS="-s USE_ZLIB=1" \
			PKG_CONFIG="" \
			LIBPNG_CFLAGS="-s USE_LIBPNG=1" \
			SDL_CFLAGS="-s USE_SDL=2" \
			FREETYPE2_CFLAGS="-s USE_FREETYPE=1" \
			GL_CFLAGS="" \
			GLU_CFLAGS="" \
			V=1 \
			LOADLIBES="" \
			LDLIBS="$(CORE_LD_LIB)" \
			OPTFLAGS="$(OPT_FLAGS) -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s SIDE_MODULE=$(USE_DYNAMIC_PLUGINS) -s FULL_ES3=1 -DNO_FILTER_THREAD=1"\
			$(PLUGIN_BUILD_TARGET)

# exported utility file helpers
$(BIN_DIR)/mupen64plus.json: $(CFG_DIR)/mupen64plus.ini
	node $(INI_TO_JSON) -i $< -o $@

# input files helpers
$(BIN_DIR)/data/InputAutoCfg.ini: $(CFG_DIR)/InputAutoCfg.ini
	mkdir -p $(@D)
	cp $< $@

$(BIN_DIR)/data/Glide64mk2.ini: $(GLIDE_CFG_DIR)/Glide64mk2.ini
	mkdir -p $(@D)
	cp $< $@

$(BIN_DIR)/data/RiceVideoLinux.ini: $(RICE_CFG_DIR)/RiceVideoLinux.ini
	mkdir -p $(@D)
	cp $< $@

$(BIN_DIR)/$(MODULE_JS): $(SCRIPTS_DIR)/$(MODULE_JS)
	mkdir -p $(@D)
	cp $< $@

$(BIN_DIR)/stats.min.js: $(SCRIPTS_DIR)/stats.min.js
	cp $< $@

$(BIN_DIR)/gamepad-utils.js: $(SCRIPTS_DIR)/gamepad-utils.js
	cp $< $@

$(BIN_DIR)/idbfs-file-utils.js: $(SCRIPTS_DIR)/idbfs-file-utils.js
	cp $< $@

$(BIN_DIR)/main.js: $(SCRIPTS_DIR)/main.js
	cp $< $@
	sed -i '1s/^/import createModule from "\.\/$(TARGET_JS)"\n/' $(BIN_DIR)/main.js

$(BIN_DIR)/data/mupen64plus.cfg: $(CFG_DIR)/mupen64plus-web.cfg
	cp $< $@

$(BIN_DIR)/data/mupen64plus.ini: $(CFG_DIR)/mupen64plus.ini
	cp $< $@

$(BIN_DIR)/data/mupencheat.txt: $(CFG_DIR)/mupencheat.txt
	cp $< $@

$(BIN_DIR)/$(TARGET_JS): $(INDEX_TEMPLATE) $(REQUIRED_PLUGINS) $(INPUT_FILES)
	@mkdir -p $(BIN_DIR)
	rm -f $@
	# building UI (program entry point)
	cd $(UI_DIR) && \
	 	emmake make \
			POSTFIX=-web \
			TARGET=$(BIN_DIR)/$(TARGET_JS) \
			UNAME=Linux \
			EMSCRIPTEN=1 \
			M64P_STATIC_PLUGINS=$(USE_STATIC_PLUGINS) \
			EXEEXT=".html" \
			USE_GLES=1 \
			ZLIB_CFLAGS="-s USE_ZLIB=1" \
			PKG_CONFIG="" \
			LIBPNG_CFLAGS="-s USE_LIBPNG=1" \
			SDL_CFLAGS="-s USE_SDL=2" \
			FREETYPE2_CFLAGS="-s USE_FREETYPE=1" \
			GL_CFLAGS="" \
			GLU_CFLAGS="" \
			V=1 \
			LDLIBS="$(STATIC_LIBRARIES)" \
			OPTFLAGS="$(OPT_FLAGS) -v \
			-s ERROR_ON_UNDEFINED_SYMBOLS=0	\
			-s MAIN_MODULE=$(USE_DYNAMIC_PLUGINS) \
			-s EXPORT_ALL=1 \
			--use-preload-plugins -lidbfs.js \
			--preload-file $(BIN_DIR)/data@data \
			--shell-file $(INDEX_TEMPLATE) \
			--js-library ../../../mupen64plus-core-web-netplay/src/jslib/corelib.js \
			--js-library ../../../mupen64plus-input-sdl/src/jslib/input-lib.js \
			-s INITIAL_MEMORY=$(MEMORY) \
			-s DEMANGLE_SUPPORT=1 -s MODULARIZE=1 -s EXPORT_NAME=\"createModule\" \
			-s ENVIRONMENT='web,worker' -s EXPORT_ES6=0 \
			-s NO_EXIT_RUNTIME=1 -s USE_ZLIB=1 \
			-s USE_SDL=2 -s USE_LIBPNG=1 -s FULL_ES3=1 \
			-s ASYNCIFY=1 -s 'ASYNCIFY_IMPORTS=[\"waitForReliableMessage\",\"waitForAsyncAction\",\"findAutoInputConfigName\", \"sdl_init_audio_device\", \"initIDBFS\", \"writeROM\", \"copyInputAutoConfig\", \"startCore\", \"compileAndPatchModule\"]' \
			-s USE_BOOST_HEADERS=1 \
			-DEMSCRIPTEN=1 --pre-js $(PRE_JS) --post-js $(POST_JS)" \
			all

core: $(CORE_DIR)/$(CORE_LIB)

$(REQUIRED_CORE_PLUGIN_FILES): .FORCE
	cd $(CORE_DIR) && \
	emmake make \
		POSTFIX=-web \
		UNAME=Linux \
		EMSCRIPTEN=1 \
		DYNAREC=1 \
		M64P_STATIC_PLUGINS=$(USE_STATIC_PLUGINS) \
		TARGET="$(CORE_LIB_JS)" \
		SONAME="" \
		SO_EXTENSION="wasm" \
		USE_GLES=1 \
		NO_ASM=1 \
		ZLIB_CFLAGS="-s USE_ZLIB=1" \
		PKG_CONFIG="" \
		LIBPNG_CFLAGS="-s USE_LIBPNG=1" \
		SDL_CFLAGS="-s USE_SDL=2" \
		FREETYPE2_CFLAGS="-s USE_FREETYPE=1" \
		GL_CFLAGS="" \
		GLU_CFLAGS="" \
		NETPLAY=1 \
		V=1 \
		OPTFLAGS="$(OPT_FLAGS) -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s SIDE_MODULE=$(USE_DYNAMIC_PLUGINS) -s EXPORT_ALL=1 -s INITIAL_MEMORY=$(MEMORY) -DONSCREEN_FPS=1 -s USE_SDL=2 -s ASYNCIFY=1 -I ../../src/api --js-library ../../../mupen64plus-core-web-netplay/src/jslib/corelib.js" \
		$(PLUGIN_BUILD_TARGET)


$(LIBSRC_DIR)/build/src/libsamplerate.a:
	cd $(LIBSRC_DIR) && \
	mkdir -p build && \
	cd build && \
	emcmake cmake -DCMAKE_CXX_FLAGS="$(OPT_FLAGS) -DEMSCRIPTEN=1" -DCMAKE_C_FLAGS="$(OPT_FLAGS) -DEMSCRIPTEN=1" .. && \
	emmake make

audio: $(AUDIO_DIR)/$(AUDIO_LIB)

$(REQUIRED_AUDIO_PLUGIN_FILES): $(LIBSRC_DIR)/build/src/libsamplerate.a .FORCE
	cd $(AUDIO_DIR) && \
		emmake make \
		POSTFIX=-web \
		UNAME="Linux" \
		EMSCRIPTEN=1 \
		M64P_STATIC_PLUGINS=$(USE_STATIC_PLUGINS) \
		NO_OSS=1 \
		SO_EXTENSION="wasm" \
		USE_GLES=1 \
		ZLIB_CFLAGS="-s USE_ZLIB=1" \
		PKG_CONFIG="" \
		LIBPNG_CFLAGS="-s USE_LIBPNG=1" \
		SDL_CFLAGS="-s USE_SDL=2" \
		FREETYPE2_CFLAGS="-s USE_FREETYPE=1" \
		GL_CFLAGS="" \
		GLU_CFLAGS="" \
		V=1 \
		SRC_LDLIBS="../../../$(LIBSRC_DIR)/build/src/libsamplerate.a" \
		OPTFLAGS="$(OPT_FLAGS) -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s SIDE_MODULE=$(USE_DYNAMIC_PLUGINS) -fPIC -DNO_FILTER_THREAD=1 -I../../../$(LIBSRC_DIR)/include"\
		$(PLUGIN_BUILD_TARGET)

glide: $(VIDEO_DIR)/$(VIDEO_LIB)

build-video: 
	cd $(VIDEO_DIR) && \
	emmake make \
		POSTFIX=-web \
		USE_FRAMESKIPPER=1 \
		EMSCRIPTEN=1 \
		M64P_STATIC_PLUGINS=$(USE_STATIC_PLUGINS) \
		SO_EXTENSION="wasm" \
		USE_GLES=1 \
		NO_ASM=1 \
		ZLIB_CFLAGS="-s USE_ZLIB=1" \
		PKG_CONFIG="" \
		LIBPNG_CFLAGS="-s USE_LIBPNG=1" \
		SDL_CFLAGS="-s USE_SDL=2" \
		FREETYPE2_CFLAGS="-s USE_FREETYPE=1" \
		GL_CFLAGS="" \
		GLU_CFLAGS="" \
		V=1 \
		LOADLIBES="" \
		LDLIBS="$(CORE_LD_LIB)" \
		OPTFLAGS="$(OPT_FLAGS) -s SIDE_MODULE=$(USE_DYNAMIC_PLUGINS) -s FULL_ES3=1 -DNO_FILTER_THREAD=1 -s USE_BOOST_HEADERS=1" \
		$(PLUGIN_BUILD_TARGET)

input: $(INPUT_DIR)/$(INPUT_LIB)


# ../../../mupen64plus-core-web-netplay/projects/unix/libmupen64plus-web.a

$(REQUIRED_INPUT_PLUGIN_FILES): .FORCE
	cd $(INPUT_DIR) && \
	emmake make \
		POSTFIX=-web \
		UNAME="Linux" \
		EMSCRIPTEN=1 \
		M64P_STATIC_PLUGINS=$(USE_STATIC_PLUGINS) \
		SO_EXTENSION="wasm" \
		USE_GLES=1 NO_ASM=1 \
		ZLIB_CFLAGS="-s USE_ZLIB=1" \
		PKG_CONFIG="" \
		LIBPNG_CFLAGS="-s USE_LIBPNG=1" \
		SDL_CFLAGS="-s USE_SDL=2" \
		FREETYPE2_CFLAGS="-s USE_FREETYPE=1" \
		GL_CFLAGS="" \
		GLU_CFLAGS="" \
		V=1 \
		LDLIBS="" \
		OPTFLAGS="$(OPT_FLAGS) -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s SIDE_MODULE=$(USE_DYNAMIC_PLUGINS) -s ASYNCIFY=1 --js-library ../../../mupen64plus-input-sdl/src/jslib/input-lib.js" \
		$(PLUGIN_BUILD_TARGET)

rsp: $(RSP_DIR)/$(RSP_LIB)

$(REQUIRED_RSP_PLUGIN_FILES): .FORCE
	cd $(RSP_DIR)&& \
	emmake make \
		POSTFIX=-web \
		UNAME=Linux \
		EMSCRIPTEN=1 \
		M64P_STATIC_PLUGINS=$(USE_STATIC_PLUGINS) \
		SO_EXTENSION="wasm" \
		USE_GLES=1 NO_ASM=1 NO_OSS=1 \
		ZLIB_CFLAGS="-s USE_ZLIB=1" \
		PKG_CONFIG="" \
		LIBPNG_CFLAGS="-s USE_LIBPNG=1" \
		SDL_CFLAGS="-s USE_SDL=2" \
		FREETYPE2_CFLAGS="-s USE_FREETYPE=1" \
		GL_CFLAGS="" \
		GLU_CFLAGS="" \
		V=1 \
		OPTFLAGS="$(OPT_FLAGS) -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s SIDE_MODULE=$(USE_DYNAMIC_PLUGINS) -DVIDEO_HLE_ALLOWED=1" \
		$(PLUGIN_BUILD_TARGET)

clean-ui:
	rm -rf $(UI_DIR)/_obj$(POSTFIX)
	rm -f $(BIN_DIR)/index.*
	rm -f $(BIN_DIR)/main.js
	rm -f $(BIN_DIR)/gamepad-utils.js
	rm -f $(BIN_DIR)/idbfs-file-utils.js

clean-web:
	rm -fr $(BIN_DIR)
	rm -f $(CORE_DIR)/$(CORE_LIB)
	rm -f $(CORE_DIR)/$(CORE_LIB_JS)
	rm -fr $(CORE_DIR)/_obj$(POSTFIX)
	rm -f $(AUDIO_DIR)/$(AUDIO_LIB)
	rm -f $(AUDIO_DIR)/$(AUDIO_LIB_JS)
	rm -fr $(AUDIO_DIR)/_obj$(POSTFIX)
	rm -f $(AUDIO_LIB_STATIC)
	rm -f $(VIDEO_DIR)/$(VIDEO_LIB)
	rm -f $(VIDEO_DIR)/$(VIDEO_LIB_JS)
	rm -fr $(VIDEO_DIR)/_obj$(POSTFIX)
	rm -f $(INPUT_DIR)/$(INPUT_LIB)
	rm -f $(INPUT_DIR)/$(INPUT_LIB_JS)
	rm -fr $(INPUT_DIR)/_obj$(POSTFIX)
	rm -f $(INPUT_LIB_STATIC)
	rm -f $(RSP_DIR)/$(RSP_LIB)
	rm -f $(RSP_DIR)/$(RSP_LIB_JS)
	rm -f $(RSP_LIB_STATIC)
	rm -fr $(RSP_DIR)/_obj$(POSTFIX)
	rm -f $(RICE_VIDEO_DIR)/$(RICE_VIDEO_LIB)
	rm -f $(RICE_VIDEO_DIR)/$(RICE_VIDEO_LIB_JS)
	rm -fr $(RICE_VIDEO_DIR)/_obj$(POSTFIX)
	rm -f $(RICE_VIDEO_LIB_STATIC)
	rm -fr $(UI_DIR)/_obj$(POSTFIX)
	rm -rf $(LIBSRC_DIR)/build

clean-video:
	rm -f $(RICE_VIDEO_LIB_STATIC)
	rm -f $(RICE_VIDEO_DIR)/$(RICE_VIDEO_LIB_JS)

clean-audio:
	rm $(AUDIO_LIB_STATIC)
	rm $(AUDIO_DIR)/$(AUDIO_LIB_JS)
