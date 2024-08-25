// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, EmbedBuilder, Client, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const noblox = require("noblox.js");
const { interactionEmbed } = require("../../functions");
const { requiredRoles } = require('../../config.json').discord;

const config = require("../../config.json");

module.exports = {
  name: "validate_cookie",
  description: "Validates a Roblox cookie and checks the connection between Discord and Roblox.",
  data: new SlashCommandBuilder()
    .setName("validate_cookie")
    .setDescription("Validates a Roblox cookie and checks the connection between Discord and Roblox."),
  /**
  * @param {Client} client
  * @param {CommandInteraction} interaction
  * @param {CommandInteractionOptionResolver} options
  */
  run: async (client, interaction, options) => {
    await interaction.deferReply({ ephemeral: false }); // Make the interaction reply ephemeral (private)
    const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }
    const cookie = config.roblox.mainOCtoken;

    try {
      // Validate the cookie and set it with the option to disable validation (false) to avoid breaking changes
      await noblox.setCookie(cookie, false); 

      // Fetch authenticated user information using the updated method
      const authenticatedUser = await noblox.getAuthenticatedUser();
      const { id, name, displayName } = authenticatedUser;

      // Construct the embed message with user information
      const embed = new EmbedBuilder()
        .setTitle("Roblox Cookie Validation")
        .setDescription("The provided Roblox cookie is valid and the connection has been successfully established.")
        .addFields(
          { name: "User ID", value: id.toString(), inline: true },
          { name: "Username", value: name, inline: true },
          { name: "Display Name", value: displayName, inline: true }
        )
        .setColor("#00FF00")
        .setTimestamp();

      // Edit the interaction reply to include the embed
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("Error validating Roblox cookie:", error);

      // Send an error message if the cookie validation fails
      return interactionEmbed(3, "Invalid Roblox cookie or failed to establish a connection. Please check the cookie and try again.", "", interaction, client, [true, 30]);
    }
  }
};
