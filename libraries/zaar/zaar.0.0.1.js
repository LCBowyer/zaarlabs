(function(exposeAs){
	/* PRIVATE */
			// MUTATION OBSERVER
			var observers = {
					config: {
						attributes: false,
						childList: true,
						subtree: true,
						targetNode: document.getElementsByTagName("body")[0]
					},
					init: function(){
						var observer = new MutationObserver(function(mutationList, observer) {
						    for(var mutation of mutationList) {
						        if (mutation.type === "childList") {
						        	eventListeners.refreshListeners(mutation.type);
						        }
						        else if(mutation.type === "attributes" && mutation.attributeName != "data-zaar-click"){
						        	eventListeners.refreshListeners(mutation.type);
						        }
						        
						    }
						});

						// Start the observer
						observer.observe(observers.config.targetNode, observers.config);
					}

				}

			observers.init();

			

			var eventListeners = {
					init: function(){
						window.addEventListener("click", function(e){
							var target = e.target,
								callbackID = target.getAttribute("DATA-ZAAR-CLICK");

							if(callbackID){
								eventListeners.callbacks.click[callbackID].callback.call(ZAAR(e.target), {
									dataset: target.dataset,
									target: target
								});
							}
						})
					},
					refreshListeners: function(mutationType){

						for(var eventType in eventListeners.callbacks){
							for(var eventListener in eventListeners.callbacks[eventType]){
								eventListenerObject = eventListeners.callbacks[eventType][eventListener];

								ZAAR(eventListenerObject.selector).setAttribute("DATA-ZAAR-" + eventType, eventListener);
							}
						}
					},
					callbacks: {}
				}

			eventListeners.init();

			
			var templates = {
				data: {}
			}

			function _select(selector){

				if(typeof selector !== "string"){
					// Presume it to be a DOM element. Need to imorove this later.
					DOMElements = [selector]
				} else {
					var regexp = /\W/g,
						firstCharacter = selector[0],
						remainingCharacters = selector.substr(1),
						noSpecialChars = !remainingCharacters.match(regexp),
						DOMElements = [];

					if(noSpecialChars){
						switch(firstCharacter){
							case ".":
								DOMElements = document.getElementsByClassName(classname);
								break;

							case "#":
								DOMElements = [document.getElementById(remainingCharacters)];
								break;

							default:
								DOMElements = document.querySelectorAll(selector);

								break;
						}

					} else {
						DOMElements = document.querySelectorAll(selector);
					}
				}

				return DOMElements

			}

	// CHAIN OBJECT
	var ZChain = function (selector, nodes) {
		this.selector = selector;

		this.nodes = nodes;
	};

			ZChain.prototype.addClass = function (className) {

				for(var i=0; i < this.nodes.length; i ++ ){
					this.nodes[i].classList.add(className);
				}

				return this;
			};

			ZChain.prototype.toggleClass = function (className) {

				for(var i=0; i < this.nodes.length; i ++ ){
					this.nodes[i].classList.toggle(className);
				}

				return this;
			};

			ZChain.prototype.removeClass = function (className) {

				for(var i=0; i < this.nodes.length; i ++ ){
					this.nodes[i].classList.remove(className);
				}

				return this;
			};

			ZChain.prototype.setAttribute = function (key, value) {

				for(var i=0; i < this.nodes.length; i ++ ){
					this.nodes[i].setAttribute(key, value);
				}

				return this;
			};

			ZChain.prototype.onClick = function (id, callback) {
				if(!eventListeners.callbacks["click"]){
					eventListeners.callbacks["click"] = {}
				}

				if(!eventListeners.callbacks["click"][id]){
					eventListeners.callbacks["click"][id] = {
						callback: callback,
						selector: this.selector
					}
				}

				for(var i=0; i < this.nodes.length; i ++ ){
					this.nodes[i].setAttribute("DATA-ZAAR-CLICK", id);
				}
				
				return this;
			};




	/* ZAAR */
	var ZAAR = function (selector) {
		var nodes = _select(selector);

		return new ZChain(selector, nodes);

	};

	

			ZAAR.version = "0.0.1";
			ZAAR.trees = "soft trees";
			ZAAR.config = {
				devmode: true
			};


			ZAAR.id = function(id){
				var nodes = [document.getElementById(id)];

				return new ZChain("#" + id, nodes);
			}

			ZAAR.class = function(classname){
				var nodes = document.getElementsByClassName(classname);

				return new ZChain("." + classname, nodes);
			}

			ZAAR.tag = function(tagname){
				var nodes = document.getElementsByTagName(tagname);

				return new ZChain(tagname, nodes);
			}

			ZAAR.replace = function(string, data, flag){
				var flag = flag || "g";

				for(var i = 0, len = data.length; i < len; i++){
					var key = data[i].key,
						value = data[i].value,
						regE = new RegExp("%" + key + "%", flag);

					string = string.replace(regE, value);
				}

				return string;
			}

			ZAAR.template = {
				set: function(id){
					templates.data[id] = document.getElementById(id).innerHTML;

					return templates.data[id];
				},
				get: function(id, data){

					var template = templates.data[id] || ZAAR.template.set(id),
						html = ZAAR.replace(template, data);

					return html;
				}
			}


			ZAAR.log = function(message){
				if(ZAAR.config.devmode){
					console.log(message)
				};
			}

			
	window[exposeAs || "ZAAR"] = ZAAR;
})();