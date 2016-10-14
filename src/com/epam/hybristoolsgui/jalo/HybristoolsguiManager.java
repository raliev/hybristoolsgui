/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2016 SAP SE or an SAP affiliate company.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of SAP
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with SAP.
 */
package com.epam.hybristoolsgui.jalo;

import de.hybris.platform.cockpit.jalo.CockpitManager;
import de.hybris.platform.core.Registry;
import de.hybris.platform.impex.jalo.ImpExManager;
import de.hybris.platform.util.CSVConstants;
import de.hybris.platform.util.JspContext;
import org.apache.log4j.Logger;
import com.epam.hybristoolsgui.constants.HybristoolsguiConstants;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;


/**
 * This is the extension manager of the hybristoolsgui extension.
 */
public class HybristoolsguiManager extends GeneratedHybristoolsguiManager
{
	/**
	 * Edit the local|project.properties to change logging behavior (properties 'log4j.*').
	 */
	@SuppressWarnings("unused")
	private final static Logger LOG = Logger.getLogger(HybristoolsguiManager.class.getName());

	/**
	 * Get the valid instance of this manager.
	 *
	 * @return the current instance of this manager
	 */
	public static final HybristoolsguiManager getInstance()
	{
		return (HybristoolsguiManager) Registry.getCurrentTenant().getJaloConnection().getExtensionManager()
				.getExtension(HybristoolsguiConstants.EXTENSIONNAME);
	}

	/**
	 * Implement this method to create initial objects. This method will be called by system creator during
	 * initialization and system update. Be sure that this method can be called repeatedly.
	 * <p>
	 * An example usage of this method is to create required cronjobs or modifying the type system (setting e.g some
	 * default values)
	 *
	 * @param params the parameters provided by user for creation of objects for the extension
	 * @param jspc the jsp context; you can use it to write progress information to the jsp page during creation
	 */
	@Override
	public void createEssentialData(final Map<String, String> params, final JspContext jspc)
	{
		// implement here code creating essential data
	}

	/**
	 * Implement this method to create data that is used in your project. This method will be called during the system
	 * initialization.
	 * <p>
	 * An example use is to import initial data like currencies or languages for your project from an csv file.
	 *
	 * @param params the parameters provided by user for creation of objects for the extension
	 * @param jspc the jsp context; you can use it to write progress information to the jsp page during creation
	 */
	@Override
	public void createProjectData(final Map<String, String> params, final JspContext jspc)
	{
		// implement here code creating project data
	}

	@SuppressWarnings("unused")
	private void importCSVFromResources(final String csv)
	{
		importCSVFromResources(csv, CSVConstants.HYBRIS_ENCODING, CSVConstants.HYBRIS_FIELD_SEPARATOR,
				CSVConstants.HYBRIS_QUOTE_CHARACTER, true);
	}

	private void importCSVFromResources(final String csv, final String encoding, final char fieldseparator,
										final char quotecharacter, final boolean codeExecution)
	{
		LOG.info("importing resource " + csv);
		final InputStream input = CockpitManager.class.getResourceAsStream(csv);
		try
		{
			if (input == null)
			{
				LOG.warn("Import resource '" + csv + "' not found!");
			}
			else
			{
				ImpExManager.getInstance().importData(input, encoding, fieldseparator, quotecharacter, codeExecution);
			}
		}
		finally
		{
			if (input != null)
			{
				try
				{
					input.close();
				}
				catch (final IOException ioe)
				{
					LOG.warn(ioe.getMessage(), ioe);
				}
			}
		}
	}
}
