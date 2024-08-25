// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, EmbedBuilder, WebhookClient, Client, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const roblox = require("noblox.js");
const { interactionEmbed, getRowifi } = require("../../functions"); // Assume getRowifi is imported from functions
const config = require("../../config.json");
const { requiredRoles } = require('../../config.json').discord;
const dsGroupId = 10421203; // DS group ID
const oaGroupId = 10436572; // OA group ID


module.exports = {
  name: "promote",
  description: "Promotes a user one rank above.",
  data: new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promotes a user one rank above.")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("Select the Discord user to promote on Roblox")
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName("group")
        .setDescription("Select the group to promote the user in.")
        .setRequired(true)
        .addChoices(
          { name: "DS Group", value: "ds" },
          { name: "OA Group", value: "oa" }
        )
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for the promotion")
        .setRequired(true)
    ),
  /**
  * @param {Client} client
  * @param {CommandInteraction} interaction
  * @param {CommandInteractionOptionResolver} options
  */
  run: async (client, interaction, options) => {
    await interaction.deferReply();
    
    // Check if the user has required roles
    const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasRole) {
      return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
    }

    const discordUser = options.getUser("user"); // Get the selected Discord user
    const selectedGroup = options.getString("group"); // Get the selected group
    const reason = options.getString("reason");

    // Determine group ID based on selected option
    const groupId = selectedGroup === "ds" ? dsGroupId : oaGroupId;

    // Fetch Roblox ID and username using RoWifi
    let robloxid, robloxname;
    try {
      const rowifi = await getRowifi(discordUser.id, client);
      robloxid = rowifi.roblox;
      robloxname = await roblox.getUsernameFromId(robloxid);
      
      if (!robloxid || !robloxname) {
        return interactionEmbed(3, "[ERR-ARGS]", `No Roblox ID found for the selected user`, interaction, client, [true, 30]);
      }
    } catch (error) {
      return interactionEmbed(3, "[ERR-ARGS]", `Error fetching Roblox ID or username for the selected user.`, interaction, client, [true, 30]);
    }

    // Check if the user is in the selected group
    if (await roblox.getRankInGroup(groupId, robloxid) == 0) {
      return interactionEmbed(3, "The user is not in the selected group.", "", interaction, client, [true, 30]);
    }
    
    // Promote the user in the selected group
    await roblox.promote(groupId, robloxid)
      .then(async (success) => {
        const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
          .setDescription(`**Moderator:** ${interaction.member} (\`${interaction.user.id}\`)\n**Action:** Promotion\n**User:** ${robloxname} (\`${robloxid}\`)\n**Rank change:** ${success.oldRole.name} (${success.oldRole.rank}) -> ${success.newRole.name} (${success.newRole.rank})\n**Reason:** ${reason}`)
          .setTimestamp()
          .setColor("#043b64");
        
        // Send embed to interaction channel
        interaction.editReply({ embeds: [embed] });

        // Log to webhook
        const webhookClient = new WebhookClient({ id: config.discord.webhookId, token: config.discord.webhookToken });
        webhookClient.send({
          content: "MTA Division",
          username: "MTA | Ranking Logs",
          embeds: [embed],
        });

        // DM the promoted user with the embed
        try {
          await discordUser.send({ embeds: [embed] });
        } catch (dmError) {
          console.log(`Failed to DM user: ${dmError.message}`);
        }
      })
      .catch((err) => {
        interactionEmbed(3, err.message, "", interaction, client, [true, 30]);
      });
  }
};
