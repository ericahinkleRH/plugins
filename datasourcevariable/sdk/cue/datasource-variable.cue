// Copyright 2024 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package datasourcevariable

import (
	datasourceVar "github.com/perses/plugins/datasourcevariable/schemas:model"
	listVarBuilder "github.com/perses/perses/cue/dac-utils/variable/list"
)

// include the definitions of listVarBuilder at the root
listVarBuilder

// specify the constraints for this variable
#pluginKind: datasourceVar.kind  
#datasourcePluginKind: datasourceVar.spec.datasourcePluginKind  

variable: listVarBuilder.variable & {  
    spec: {  
        plugin: datasourceVar & {  
            spec: {  
                datasourcePluginKind: #datasourcePluginKind  
            }  
        }  
    }  
}  