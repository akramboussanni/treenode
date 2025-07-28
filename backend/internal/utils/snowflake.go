package utils

import (
	"github.com/bwmarrin/snowflake"
)

var node *snowflake.Node

func InitSnowflake(nodeID int64) error {
	var err error
	node, err = snowflake.NewNode(nodeID)
	return err
}

func GenerateSnowflakeID() int64 {
	return node.Generate().Int64()
}
