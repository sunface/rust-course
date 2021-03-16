// Copyright © 2019 NAME HERE <EMAIL ADDRESS>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cmd

import (
	"github.com/imdotdev/im.dev/server/internal/storage"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var resetNavbarCmd = &cobra.Command{
	Use:   "resetNav",
	Short: "reset navbars to home,tags,search",
	Long:  ``,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	Run: func(cmd *cobra.Command, args []string) {
		config.Init("config.yaml")
		log.InitLogger(config.Data.Common.LogLevel)
		err := storage.ResetNavbars()
		if err != nil {
			log.RootLogger.Crit("reset navbars error", "error", err)
		} else {
			log.RootLogger.Info("reset navbars successfully")
		}
	},
}

func init() {
	rootCmd.AddCommand(resetNavbarCmd)
}
